#!/usr/bin/env python3
"""
PHISHING URL DETECTOR - Advanced ML Model
Detektor scam URL oparty na Random Forest z prawdopodobienstwem
"""

import pandas as pd
import numpy as np
import pickle
import json
from urllib.parse import urlparse
import re
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                               f1_score, roc_auc_score, classification_report,
                               confusion_matrix, roc_curve)
from sklearn.feature_selection import SelectKBest, mutual_info_classif
import xgboost as xgb


class PhishingDetector:
    """
    Zaawansowany detektor phishing URL oparty na ensemble ML.
    Zwraca prawdopodobienstwo scamu w procentach.
    """

    def __init__(self, model_path=None):
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_names = None
        self.selected_features = None
        self.feature_importance = None
        self.is_trained = False
        self.feature_medians = None

        if model_path:
            self.load_model(model_path)

    def load_dataset(self, csv_path):
        """Wczytanie i przygotowanie zbioru danych."""
        print(f"[INFO] Wczytywanie danych z {csv_path}...")

        df = pd.read_csv(csv_path)

        # Usuniecie pustych wierszy
        df = df.dropna()

        print(f"[INFO] Zaladowano {len(df)} probek")
        print(f"[INFO] Kolumny: {df.columns.tolist()[:5]}... (razem {len(df.columns)})")

        return df

    def preprocess_data(self, df):
        """Przetwarzanie wstepne danych."""
        print("[INFO] Przetwarzanie danych...")

        # Rozdzielenie na cechy i etykiety
        X = df.drop(['url', 'status'], axis=1, errors='ignore')

        # Kodowanie etykiet
        if 'status' in df.columns:
            y = df['status'].map({'legitimate': 0, 'phishing': 1})
        else:
            y = None

        # Zapisanie nazw cech
        self.feature_names = X.columns.tolist()

        # Zapisanie median dla cech (do uzycia w predykcji)
        X_clean = X.replace(-1, np.nan)
        self.feature_medians = X_clean.median().to_dict()

        # Usuniecie kolumn z samymi zerami lub brakami danych
        X = X.replace(-1, np.nan)
        X = X.fillna(X.median())

        return X, y

    def extract_features_from_url(self, url):
        """Ekstrakcja wszystkich cech z pojedynczego URL."""
        features = {}

        # Podstawowe statystyki URL
        features['length_url'] = len(url)

        # Parsowanie URL
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc
            path = parsed.path
            query = parsed.query
        except:
            hostname = ""
            path = ""
            query = ""

        features['length_hostname'] = len(hostname)

        # Sprawdzenie czy URL zawiera IP
        ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        features['ip'] = 1 if re.search(ip_pattern, hostname) else 0

        # Zliczanie znakow specjalnych
        features['nb_dots'] = url.count('.')
        features['nb_hyphens'] = url.count('-')
        features['nb_at'] = url.count('@')
        features['nb_qm'] = url.count('?')
        features['nb_and'] = url.count('&')
        features['nb_or'] = url.count('|')
        features['nb_eq'] = url.count('=')
        features['nb_underscore'] = url.count('_')
        features['nb_tilde'] = url.count('~')
        features['nb_percent'] = url.count('%')
        features['nb_slash'] = url.count('/')
        features['nb_star'] = url.count('*')
        features['nb_colon'] = url.count(':')
        features['nb_comma'] = url.count(',')
        features['nb_semicolumn'] = url.count(';')
        features['nb_dollar'] = url.count('$')
        features['nb_space'] = url.count(' ')

        # Obecnosc www i com
        features['nb_www'] = url.lower().count('www')
        features['nb_com'] = url.lower().count('.com')

        # Double slash w sciezce (poza ://)
        features['nb_dslash'] = url.count('//') - 1 if '://' in url else url.count('//')

        # HTTP/HTTPS w sciezce
        features['http_in_path'] = 1 if 'http' in path.lower() else 0
        features['https_token'] = 1 if url.startswith('https://') else 0

        # Stosunek cyfr
        digits_url = sum(c.isdigit() for c in url)
        features['ratio_digits_url'] = digits_url / len(url) if url else 0

        digits_host = sum(c.isdigit() for c in hostname)
        features['ratio_digits_host'] = digits_host / len(hostname) if hostname else 0

        # Punycode (IDN attack)
        features['punycode'] = 1 if 'xn--' in url.lower() else 0

        # Port (sprawdzenie czy jawnie podany)
        features['port'] = 1 if ':' in hostname and any(port_part.isdigit() for port_part in hostname.split(':')[-1:]) else 0

        # TLD w sciezce/subdomenie
        common_tlds = ['.com', '.org', '.net', '.edu', '.gov', '.co', '.io']
        features['tld_in_path'] = 1 if any(tld in path.lower() for tld in common_tlds) else 0
        features['tld_in_subdomain'] = 1 if any(tld in hostname.lower() for tld in common_tlds) else 0

        # Subdomeny
        if hostname:
            parts = hostname.split('.')
            if len(parts) > 2:
                subdomains = parts[:-2]
                features['abnormal_subdomain'] = 1 if any(len(sd) > 22 for sd in subdomains) else 0
                features['nb_subdomains'] = len(parts) - 2
            else:
                features['abnormal_subdomain'] = 0
                features['nb_subdomains'] = 0 if len(parts) <= 2 else len(parts) - 2
        else:
            features['abnormal_subdomain'] = 0
            features['nb_subdomains'] = 0

        # Prefix-suffix
        features['prefix_suffix'] = 1 if len(re.findall(r'[a-zA-Z]+-[a-zA-Z]+', hostname)) > 2 else 0

        # Losowa domena (długa z cyframi)
        if hostname:
            domain_part = hostname.split('.')[0] if '.' in hostname else hostname
            features['random_domain'] = 1 if (len(domain_part) > 20 and
                                             sum(c.isdigit() for c in domain_part) > 3) else 0
        else:
            features['random_domain'] = 0

        # Skracacz URL
        shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'short.link',
                     'is.gd', 'buff.ly', 'adf.ly', 'bitly.com', 'rb.gy']
        features['shortening_service'] = 1 if any(s in url.lower() for s in shorteners) else 0

        # Rozszerzenie w sciezce
        suspicious_exts = ['.exe', '.zip', '.rar', '.pdf', '.doc', '.docx']
        features['path_extension'] = 1 if any(path.lower().endswith(ext) for ext in suspicious_exts) else 0

        # Przekierowania
        features['nb_redirection'] = url.count('//') + url.count('redirect') + url.count('url=') + url.count('link=')
        features['nb_external_redirection'] = 1 if url.count('http') > 1 else 0

        # Analiza slow
        words_raw = re.findall(r'\b\w+\b', url)
        features['length_words_raw'] = len(words_raw)

        # Powtarzajace sie znaki
        char_counts = {}
        for c in url.lower():
            if c.isalnum():
                char_counts[c] = char_counts.get(c, 0) + 1
        features['char_repeat'] = 1 if any(count > len(url) * 0.1 for count in char_counts.values()) else 0

        if words_raw:
            word_lengths = [len(w) for w in words_raw]
            features['shortest_words_raw'] = min(word_lengths)
            features['longest_words_raw'] = max(word_lengths)
            features['avg_words_raw'] = sum(word_lengths) / len(word_lengths)
        else:
            features['shortest_words_raw'] = 0
            features['longest_words_raw'] = 0
            features['avg_words_raw'] = 0

        # Analiza hostname
        host_words = re.findall(r'\b[a-zA-Z]+\b', hostname)
        host_lengths = [len(w) for w in host_words] if host_words else []
        if host_lengths:
            features['shortest_word_host'] = min(host_lengths)
            features['longest_word_host'] = max(host_lengths)
            features['avg_word_host'] = sum(host_lengths) / len(host_lengths)
        else:
            features['shortest_word_host'] = 0
            features['longest_word_host'] = 0
            features['avg_word_host'] = 0

        # Analiza sciezki
        path_words = re.findall(r'\b\w+\b', path)
        path_lengths = [len(w) for w in path_words] if path_words else []
        if path_lengths:
            features['shortest_word_path'] = min(path_lengths)
            features['longest_word_path'] = max(path_lengths)
            features['avg_word_path'] = sum(path_lengths) / len(path_lengths)
        else:
            features['shortest_word_path'] = 0
            features['longest_word_path'] = 0
            features['avg_word_path'] = 0

        # Wskazniki phishingu
        phishing_hints = ['secure', 'account', 'webscr', 'login', 'ebayisapi', 'signin',
                         'banking', 'confirm', 'paypal', 'verify', 'update', 'suspend',
                         'authentication', 'billing', 'service', 'security']
        features['phish_hints'] = sum(1 for hint in phishing_hints if hint in url.lower())

        # Marki w domenie
        brands = ['paypal', 'apple', 'amazon', 'microsoft', 'google', 'facebook',
                 'ebay', 'netflix', 'bank', 'visa', 'mastercard', 'chase', 'wellsfargo']
        hostname_lower = hostname.lower()
        features['domain_in_brand'] = 1 if any(b == hostname_lower.split('.')[0] or
                                                b + '.' in hostname_lower for b in brands) else 0

        # Marka w subdomenie
        if 'nb_subdomains' in features and features['nb_subdomains'] > 0:
            sub_parts = hostname.split('.')[:-2]
            sub_str = '.'.join(sub_parts).lower()
            features['brand_in_subdomain'] = 1 if any(b in sub_str for b in brands) else 0
        else:
            features['brand_in_subdomain'] = 0

        features['brand_in_path'] = 1 if any(b in path.lower() for b in brands) else 0

        # Podejrzane TLD
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.top', '.xyz', '.online', '.site', '.work', '.click']
        features['suspecious_tld'] = 1 if any(hostname.lower().endswith(tld) for tld in suspicious_tlds) else 0

        return features

    def prepare_single_url(self, url):
        """Przygotowanie wszystkich cech dla pojedynczego URL."""
        # Ekstrakcja cech z URL
        url_feats = self.extract_features_from_url(url)

        # Uzupelnienie brakujacych cech medianami z zbioru treningowego
        if self.feature_medians:
            for feature_name in self.feature_names:
                if feature_name not in url_feats:
                    url_feats[feature_name] = self.feature_medians.get(feature_name, 0)

        # Utworzenie DataFrame
        df = pd.DataFrame([url_feats])

        # Upewnienie sie ze kolumny sa w tej samej kolejnosci
        if self.feature_names:
            df = df[self.feature_names]

        return df

    def train(self, X, y, model_type='ensemble'):
        """Trenowanie modelu."""
        print("\n[INFO] Trenowanie modelu...")

        # Podzial na zbiory
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"[INFO] Zbior treningowy: {len(X_train)} probek")
        print(f"[INFO] Zbior testowy: {len(X_test)} probek")

        if model_type == 'rf':
            model = RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            self.models['rf'] = model

        elif model_type == 'xgb':
            model = xgb.XGBClassifier(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='logloss'
            )
            model.fit(X_train, y_train)
            self.models['xgb'] = model

        elif model_type == 'ensemble':
            # Ensemble - Random Forest
            rf_model = RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            rf_model.fit(X_train, y_train)
            self.models['rf'] = rf_model

            # Ensemble - XGBoost
            xgb_model = xgb.XGBClassifier(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='logloss'
            )
            xgb_model.fit(X_train, y_train)
            self.models['xgb'] = xgb_model

            # Ensemble - Gradient Boosting
            gb_model = GradientBoostingClassifier(
                n_estimators=150,
                max_depth=8,
                learning_rate=0.1,
                random_state=42
            )
            gb_model.fit(X_train, y_train)
            self.models['gb'] = gb_model

        # Ewaluacja
        self.evaluate(X_test, y_test)

        # Zapisanie waznosci cech
        if 'rf' in self.models:
            self.feature_importance = dict(zip(
                self.feature_names,
                self.models['rf'].feature_importances_
            ))

        self.is_trained = True
        print("\n[SUKCES] Model wytrenowany!")

        return self

    def evaluate(self, X_test, y_test):
        """Ewaluacja modelu."""
        print("\n" + "="*60)
        print("EWALUACJA MODELU")
        print("="*60)

        results = {}

        for name, model in self.models.items():
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred)
            rec = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            auc = roc_auc_score(y_test, y_prob)

            results[name] = {
                'accuracy': acc,
                'precision': prec,
                'recall': rec,
                'f1': f1,
                'auc': auc
            }

            print(f"\n[{name.upper()}]:")
            print(f"  Dokladnosc (Accuracy):  {acc:.4f} ({acc*100:.2f}%)")
            print(f"  Precyzja (Precision):  {prec:.4f} ({prec*100:.2f}%)")
            print(f"  Czulosc (Recall):      {rec:.4f} ({rec*100:.2f}%)")
            print(f"  F1-Score:              {f1:.4f}")
            print(f"  AUC-ROC:               {auc:.4f}")

        print("\n" + "="*60)

        return results

    def predict(self, url):
        """
        Predykcja dla pojedynczego URL.
        Zwraca slownik z prawdopodobienstwem scamu.
        """
        if not self.is_trained:
            raise ValueError("Model nie zostal jeszcze wytrenowany!")

        # Ekstrakcja cech
        features = self.prepare_single_url(url)

        # Predykcja z kazdego modelu
        probabilities = []

        for name, model in self.models.items():
            if hasattr(model, 'predict_proba'):
                prob = model.predict_proba(features)[0, 1]
                probabilities.append(prob)

        # Srednia wazona (ensemble)
        if len(probabilities) >= 3:
            final_prob = (0.4 * probabilities[0] + 0.4 * probabilities[1] + 0.2 * probabilities[2])
        else:
            final_prob = np.mean(probabilities)

        # Klasyfikacja
        prediction = 1 if final_prob > 0.5 else 0

        # Szczegolowa analiza ryzyka
        risk_level = self._calculate_risk_level(final_prob)

        # Powody podejrzenia
        reasons = self._analyze_reasons(url, features)

        return {
            'url': url,
            'is_scam': prediction == 1,
            'scam_probability': round(final_prob * 100, 2),
            'legitimate_probability': round((1 - final_prob) * 100, 2),
            'risk_level': risk_level,
            'reasons': reasons,
            'model_predictions': {
                name: round(prob * 100, 2)
                for name, prob in zip(self.models.keys(), probabilities)
            }
        }

    def _calculate_risk_level(self, probability):
        """Obliczenie poziomu ryzyka."""
        if probability < 0.2:
            return "BARDZO NISKIE"
        elif probability < 0.4:
            return "NISKIE"
        elif probability < 0.6:
            return "SREDNIE"
        elif probability < 0.8:
            return "WYSOKIE"
        else:
            return "BARDZO WYSOKIE"

    def _analyze_reasons(self, url, features):
        """Analiza powodow podejrzenia."""
        reasons = []

        features_dict = features.iloc[0].to_dict()

        # Dlugosc URL
        if features_dict.get('length_url', 0) > 75:
            reasons.append(f"URL zbyt dlugi ({features_dict['length_url']} znakow)")

        # Zawiera IP
        if features_dict.get('ip', 0) == 1:
            reasons.append("URL zawiera adres IP zamiast domeny")

        # Wiele kropek
        if features_dict.get('nb_dots', 0) > 4:
            reasons.append(f"Zbyt wiele kropek w domenie ({features_dict['nb_dots']})")

        # Skracacz URL
        if features_dict.get('shortening_service', 0) == 1:
            reasons.append("Uzywa skracacza URL")

        # HTTPS w sciezce
        if features_dict.get('http_in_path', 0) == 1:
            reasons.append("'http/https' wystepuje w sciezce URL")

        # Podejrzane TLD
        if features_dict.get('suspecious_tld', 0) == 1:
            reasons.append("Uzywa podejrzanego TLD (.tk, .ml, .xyz itp.)")

        # Wiele subdomen
        if features_dict.get('nb_subdomains', 0) > 3:
            reasons.append(f"Zbyt wiele subdomen ({features_dict['nb_subdomains']})")

        # Losowa domena
        if features_dict.get('random_domain', 0) == 1:
            reasons.append("Domena wyglada na losowo wygenerowana")

        # Marka w subdomenie
        if features_dict.get('brand_in_subdomain', 0) == 1:
            reasons.append("Znana marka w subdomenie - potencjalny phishing")

        # Brak HTTPS
        if features_dict.get('https_token', 0) == 0:
            reasons.append("Brak szyfrowania HTTPS")

        # Wiele parametrow
        if features_dict.get('nb_eq', 0) > 3:
            reasons.append(f"Zbyt wiele parametrow URL ({features_dict['nb_eq']})")

        return reasons if reasons else ["Brak oczywistych zagrozen strukturalnych"]

    def save_model(self, path):
        """Zapis modelu do pliku."""
        data = {
            'models': self.models,
            'feature_names': self.feature_names,
            'feature_medians': self.feature_medians,
            'feature_importance': self.feature_importance,
            'is_trained': self.is_trained
        }
        with open(path, 'wb') as f:
            pickle.dump(data, f)
        print(f"[INFO] Model zapisany do: {path}")

    def load_model(self, path):
        """Wczytanie modelu z pliku."""
        with open(path, 'rb') as f:
            data = pickle.load(f)

        self.models = data['models']
        self.feature_names = data['feature_names']
        self.feature_medians = data.get('feature_medians')
        self.feature_importance = data.get('feature_importance')
        self.is_trained = data.get('is_trained', True)
        print(f"[INFO] Model wczytany z: {path}")


def main():
    """Glowna funkcja - trening i testowanie."""
    print("="*60)
    print("PHISHING URL DETECTOR - Trening Modelu")
    print("="*60)

    # Inicjalizacja
    detector = PhishingDetector()

    # Wczytanie danych
    df = detector.load_dataset('dataset_phishing.csv')

    # Przetwarzanie
    X, y = detector.preprocess_data(df)

    print(f"\n[INFO] Liczba cech: {len(X.columns)}")
    print(f"[INFO] Rozklad klas:")
    print(f"       - Legitimate: {(y==0).sum()} ({(y==0).mean()*100:.1f}%)")
    print(f"       - Phishing: {(y==1).sum()} ({(y==1).mean()*100:.1f}%)")

    # Trening ensemble
    detector.train(X, y, model_type='ensemble')

    # Zapis modelu
    detector.save_model('phishing_model.pkl')

    # Testowanie przykladow
    print("\n" + "="*60)
    print("TESTOWANIE PRZYKLADOW")
    print("="*60)

    test_urls = [
        "https://www.google.com/search?q=test",
        "https://paypal.com.signin.verify.account-update.com/login",
        "http://192.168.1.1/bank/login.php",
        "https://amazon.com",
        "http://bit.ly/abc123phish",
        "https://secure-appleid-verify-now.tk/login",
    ]

    for url in test_urls:
        result = detector.predict(url)
        print(f"\n{'='*60}")
        print(f"URL: {url}")
        print(f"{'='*60}")
        print(f"Wynik: {'SCAM!' if result['is_scam'] else 'Bezpieczny'}")
        print(f"Prawdopodobienstwo SCAM: {result['scam_probability']}%")
        print(f"Poziom ryzyka: {result['risk_level']}")
        print(f"\nPowody:")
        for reason in result['reasons']:
            print(f"  - {reason}")
        print(f"\nPredykcje modeli:")
        for model, prob in result['model_predictions'].items():
            print(f"  {model.upper()}: {prob}%")

    print("\n" + "="*60)
    print("Trening zakonczony pomyslnie!")
    print("="*60)


if __name__ == "__main__":
    main()
