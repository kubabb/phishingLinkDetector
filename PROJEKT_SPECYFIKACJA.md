# SPECJFIKACJA PROJEKTU: Phishing URL Detector

## 📋 Opis Projektu

**Nazwa:** Phishing URL Detector  
**Wersja:** 1.0.0  
**Data utworzenia:** 2025-04-21  
**Cel:** Automatyczna detekcja zlosliwych URL (phishing/scam) z prawdopodobienstwem ryzyka

---

## 🎯 Zalozenia Funkcjonalne

### Glowne Funkcjonalnosci
1. **Analiza URL w czasie rzeczywistym** - ekstrakcja 111 cech z pojedynczego adresu
2. **Predykcja prawdopodobienstwa** - zwraca % szansy na scam (0-100%)
3. **Klasyfikacja ryzyka** - 5 poziomow: BARDZO NISKIE, NISKIE, SREDNIE, WYSOKIE, BARDZO WYSOKIE
4. **Uzasadnienie decyzji** - lista konkretnych powodow podejrzenia
5. **Ensemble ML** - laczy Random Forest, XGBoost i Gradient Boosting dla najlepszej dokladnosci

### Wejscie
- Pojedynczy URL (string)
- Opcjonalnie: zawartosc HTML strony (dla pelniejszej analizy)

### Wyjscie
```json
{
  "url": "https://example.com",
  "is_scam": true/false,
  "scam_probability": 87.45,
  "legitimate_probability": 12.55,
  "risk_level": "WYSOKIE",
  "reasons": ["Brak HTTPS", "Podejrzane TLD", ...],
  "model_predictions": {
    "rf": 89.2,
    "xgb": 85.1,
    "gb": 88.0
  }
}
```

---

## 🗃️ Baza Danych

### Zrodlo
Plik: `dataset_phishing.csv`

### Statystyki
- **Liczba probek:** ~10,000+ URL
- **Liczba cech:** 111 (kolumny)
- **Klasy:**
  - `legitimate` (0) - strony bezpieczne
  - `phishing` (1) - strony zlosliwe
- **Format:** CSV z naglowkami

### Struktura Cech

#### Grupa 1: Cechy Strukturalne URL (56 cech)
| Kategoria | Przyklady cech | Opis |
|-----------|----------------|------|
| Dlugosc | `length_url`, `length_hostname` | Dlugosc adresu i domeny |
| Znaki specjalne | `nb_dots`, `nb_hyphens`, `nb_at`, `nb_qm` | Zliczanie znakow specjalnych |
| Protokol | `https_token`, `http_in_path` | Obecnosc HTTPS/HTTP |
| Cyfry | `ratio_digits_url`, `ratio_digits_host` | Stosunek cyfr do calkowitej dlugosci |
| Domena | `nb_www`, `nb_com`, `nb_subdomains` | Analiza budowy domeny |
| Kodowanie | `punycode` | Detekcja IDN attack |
| Bezpieczenstwo | `shortening_service`, `suspecious_tld` | Skracacze i podejrzane TLD |

#### Grupa 2: Cechy Leksykalne (19 cech)
| Cecha | Opis |
|-------|------|
| `length_words_raw` | Liczba slow w URL |
| `shortest_words_raw` | Dlugosc najkrotszego slowa |
| `longest_words_raw` | Dlugosc najdluzszego slowa |
| `avg_words_raw` | Srednia dlugosc slowa |
| `char_repeat` | Powtarzajace sie znaki |
| `random_domain` | Losowo wygenerowana domena |
| `phish_hints` | Wskazniki phishingu (login, verify, bank) |

#### Grupa 3: Cechy Marki (4 cechy)
- `domain_in_brand` - znana marka w domenie
- `brand_in_subdomain` - marka w subdomenie (podejrzane!)
- `brand_in_path` - marka w sciezce
- `prefix_suffix` - podejrzany prefix/suffix

#### Grupa 4: Cechy Strony Web (32 cechy)
*Wymagaja crawlingu - w modelu uzywane wartosci domyslne lub z datasetu*

| Kategoria | Przyklady |
|-----------|-----------|
| Linki | `nb_hyperlinks`, `ratio_intHyperlinks`, `ratio_extHyperlinks` |
| Formularze | `login_form`, `submit_email` |
| Zabezpieczenia | `sfh` (Server Form Handler), `iframe` |
| Spolecznosciowe | `domain_age`, `web_traffic`, `page_rank` |
| WHOIS | `domain_registration_length`, `whois_registered_domain` |

---

## 🧠 Algorytm ML

### Architektura: Ensemble (Komitet Modeli)

```
INPUT URL
    |
    v
[Ekstrakcja 111 cech]
    |
    v
+-------------------+
|   Random Forest   | --> [predykcja 40% wagi]
|   (200 drzew)     |
+-------------------+
    |
    v
+-------------------+
|     XGBoost       | --> [predykcja 40% wagi]
|   (200 estymatorow)|
+-------------------+
    |
    v
+-------------------+
| Gradient Boosting | --> [predykcja 20% wagi]
|   (150 estymatorow)|
+-------------------+
    |
    v
[Wazona srednia] = (0.4*RF + 0.4*XGB + 0.2*GB)
    |
    v
OUTPUT: Prawdopodobienstwo SCAM (0-100%)
```

### Parametry Modeli

#### Random Forest
```python
n_estimators=200      # Liczba drzew
max_depth=20          # Maksymalna glebokosc
min_samples_split=5   # Min probki do podzialu
min_samples_leaf=2    # Min probki w lisciu
random_state=42       # Reprodukowalnosc
n_jobs=-1             # Wszystkie rdzenie CPU
```

#### XGBoost
```python
n_estimators=200      # Liczba rund boosting
max_depth=10          # Glebokosc drzew
learning_rate=0.1     # Szybkosc uczenia
subsample=0.8         # Frakcja probek
subsample_bytree=0.8  # Frakcja cech
eval_metric='logloss' # Funkcja straty
```

#### Gradient Boosting
```python
n_estimators=150
max_depth=8
learning_rate=0.1
random_state=42
```

### Funkcja Decyzyjna
```
Jesli prawdopodobienstwo_scam > 50%:
    Klasyfikacja = "SCAM"
W przeciwnym razie:
    Klasyfikacja = "BEZPIECZNY"

Poziomy ryzyka:
    0-20%   -> BARDZO NISKIE
    20-40%  -> NISKIE
    40-60%  -> SREDNIE
    60-80%  -> WYSOKIE
    80-100% -> BARDZO WYSOKIE
```

---

## 📊 Metryki Ewaluacji

### Uzywane Metryki
| Metryka | Opis | Docelowa wartosc |
|---------|------|------------------|
| Accuracy | Ogolna dokladnosc | > 95% |
| Precision | Precyzja (TP / (TP+FP)) | > 95% |
| Recall | Czulosc (TP / (TP+FN)) | > 90% |
| F1-Score | Srednia harmoniczna P i R | > 92% |
| AUC-ROC | Obszar pod krzywa ROC | > 0.95 |

### Podzial Danych
- Trening: 80%
- Test: 20%
- Stratyfikacja: zachowana proporcja klas
- Random state: 42 (reprodukowalnosc)

---

## 🔧 Uzytkowanie

### Trening Modelu
```bash
python phishing_detector.py
```

Wyniki:
- Wytrenowane modele (RF, XGB, GB)
- Plik: `phishing_model.pkl`
- Raport ewaluacji z metrykami

### Sprawdzenie Pojedynczego URL
```bash
python phishing_api.py "https://example.com"
```

### Tryb Interaktywny
```bash
python phishing_api.py
> Wpisz URL do sprawdzenia...
```

### Uzycie w Kodzie
```python
from phishing_detector import PhishingDetector

# Wczytanie wytrenowanego modelu
detector = PhishingDetector('phishing_model.pkl')

# Predykcja
result = detector.predict("https://suspicious-site.com")

print(f"Prawdopodobienstwo: {result['scam_probability']}%")
print(f"Poziom ryzyka: {result['risk_level']}")
```

---

## 🚀 Instalacja

### Wymagania
```
Python >= 3.8
pandas >= 1.5.0
numpy >= 1.21.0
scikit-learn >= 1.1.0
xgboost >= 1.6.0
```

### Instalacja zaleznosci
```bash
pip install pandas numpy scikit-learn xgboost
```

---

## 🛡️ Bezpieczenstwo i Uwagi

### Ograniczenia
1. **Cechy wymagajace crawlingu** - niektore cechy (linki, formularze) wymagaja pobrania strony
2. **Nowe techniki phishingu** - model może nie wykrywac nowych, nieznanych wzorow
3. **False positives** - niektore bezpieczne strony moga byc oznaczone jako podejrzane

### Zalecane Praktyki
- Regularne przetrenowywanie modelu z nowymi danymi
- Kombinacja z blacklistami reputacji domen
- Weryfikacja wynikow z zewnetrznymi bazami (VirusTotal, Google Safe Browsing)

---

## 📁 Struktura Plikow

```
project/
│
├── dataset_phishing.csv      # Zbior treningowy (111 cech + etykiety)
├── phishing_detector.py      # Glowny skrypt - trening i klasa PhishingDetector
├── phishing_api.py           # Interfejs CLI/API do sprawdzania URL
├── phishing_model.pkl        # Wytrenowany model (generowany)
├── PROJEKT_SPECYFIKACJA.md   # Ten plik - dokumentacja projektu
│
└── README.md                 # Instrukcja uzycia (opcjonalnie)
```

---

## 📝 Kluczowe Cechy Phishingu (Jak Model Rozpoznaje Scam)

### 🚩 Czerwone Flagi (wysokie ryzyko)
1. **Adres IP w URL** zamiast domeny (np. `http://192.168.1.1/bank/`)
2. **Zbyt dlugi URL** (>75 znakow) z wieloma parametrami
3. **Skracacze URL** (bit.ly, tinyurl) - ukrywa prawdziwy adres
4. **Marka w subdomenie** (np. `paypal.com.scam-site.com`)
5. **Podejrzane TLD** (.tk, .ml, .xyz, .top)
6. **Brak HTTPS** lub HTTPS w sciezce (np. `http://site.com/https://bank/login`)
7. **Losowa domena** (np. `x7k9m2.tk`) - wygenerowana automatycznie
8. **Wiele subdomen** (np. `login.secure.bank.update.scam.com`)
9. **Wiele kropek** w domenie (>4)
10. **Znane slowa phishingowe**: "verify", "update", "secure", "account", "suspend"

### ✅ Zielone Flagi (niskie ryzyko)
1. **Znana domena** w glownej czesci (google.com, amazon.com)
2. **HTTPS z wlasciwym certyfikatem**
3. **Krotka sciezka** bez podejrzanych parametrow
4. **Brak znakow specjalnych** poza standardowymi
5. **Stara domena** (duzy wiek w WHOIS)
6. **Wysoki PageRank** i ruch webowy

---

## 🔮 Rozszerzenia Przyszle

1. **Crawling stron** - pobieranie HTML dla pelnych cech
2. **Deep Learning** - LSTM/Transformer dla analizy sekwencji URL
3. **Real-time WHOIS** - sprawdzanie wieku domeny przez API
4. **Geolokalizacja** - analiza lokalizacji serwera
5. **Browser Extension** - integracja z przegladarka
6. **API REST** - endpoint HTTP dla zewnetrznych aplikacji

---

## 📚 Zrodla i Bibliografia

- Zbior danych: Phishing Website Dataset (UCI/UWG)
- Algorytmy: Scikit-learn, XGBoost
- Wzorce phishingu: OWASP, PhishTank, OpenPhish

---

**Autor:** AI Assistant (Kimi K2.5)  
**Licencja:** MIT  
**Ostatnia aktualizacja:** 2025-04-21
