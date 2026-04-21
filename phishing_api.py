#!/usr/bin/env python3
"""
PHISHING DETECTOR API - Szybkie sprawdzanie URL
Uzyj: python phishing_api.py <url>
"""

import sys
import pickle
from phishing_detector import PhishingDetector


def check_url(url, model_path='phishing_model.pkl'):
    """Szybkie sprawdzenie URL."""
    try:
        detector = PhishingDetector(model_path)
    except FileNotFoundError:
        print("[BLAD] Model nie zostal znaleziony. Uruchom najpierw phishing_detector.py")
        return None

    return detector.predict(url)


def print_result(result):
    """Wyswietlenie wyniku w przejrzysty sposob."""
    if not result:
        return

    url = result['url']
    prob = result['scam_probability']
    is_scam = result['is_scam']
    risk = result['risk_level']

    # ASCII art bar
    bar_len = 50
    filled = int(prob / 100 * bar_len)
    bar = '█' * filled + '░' * (bar_len - filled)

    print("\n" + "="*70)
    print(" "*20 + "WYNIK ANALIZY URL")
    print("="*70)
    print(f"\n📍 URL: {url[:67]}..." if len(url) > 70 else f"\n📍 URL: {url}")
    print(f"\n{'='*70}")

    # Glowny wynik
    if is_scam:
        print("\n  ███████╗ ██████╗ █████╗ ███╗   ███╗██╗███╗   ██╗ ██████╗ ███████╗")
        print("  ██╔════╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔════╝ ██╔════╝")
        print("  ███████╗██║     ███████║██╔████╔██║██║██╔██╗ ██║██║  ███╗█████╗  ")
        print("  ╚════██║██║     ██╔══██║██║╚██╔╝██║██║██║╚██╗██║██║   ██║██╔══╝  ")
        print("  ███████║╚██████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║╚██████╔╝███████╗")
        print("  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝")
    else:
        print("\n  ██████╗ ███████╗███████╗██████╗ ██╗███████╗███████╗███████╗███████╗")
        print("  ██╔══██╗██╔════╝██╔════╝██╔══██╗██║██╔════╝██╔════╝██╔════╝██╔════╝")
        print("  ██████╔╝█████╗  ███████╗██████╔╝██║█████╗  █████╗  ███████╗███████╗")
        print("  ██╔══██╗██╔══╝  ╚════██║██╔═══╝ ██║██╔══╝  ██╔══╝  ╚════██║╚════██║")
        print("  ██████╔╝███████╗███████║██║     ██║███████╗██║     ███████║███████║")
        print("  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝     ╚══════╝╚══════╝")

    print(f"\n{'='*70}")
    print(f"\n  PRAWDOPODOBIENSTWO SCAM:  {prob:.2f}%")
    print(f"  ŚREDNIE RYZYKO:           {risk}")
    print(f"  LEGITYMACJA:              {result['legitimate_probability']:.2f}%")
    print(f"\n  [{bar}] {prob:.1f}%")
    print(f"\n{'='*70}")

    # Powody
    print("\n  🔍 POWODY ANALIZY:")
    print("  " + "-"*66)
    for i, reason in enumerate(result['reasons'][:5], 1):
        print(f"  {i}. {reason}")
    if len(result['reasons']) > 5:
        print(f"     ... i {len(result['reasons']) - 5} wiecej")

    # Predykcje modeli
    print(f"\n{'='*70}")
    print("  🤖 PREDYKCJE POSZCZEGOLNYCH MODELI:")
    print("  " + "-"*66)
    for model, prob_model in result['model_predictions'].items():
        status = "SCAM" if prob_model > 50 else "OK"
        print(f"     {model.upper():12} : {prob_model:6.2f}% [{status}]")

    print(f"\n{'='*70}")
    print("\n  ℹ️  WERSJA ENSEMBLE (srednia wazona): najbardziej wiarygodna")
    print(f"\n{'='*70}\n")

    return result


def interactive_mode():
    """Tryb interaktywny."""
    print("="*70)
    print("  PHISHING DETECTOR - Tryb Interaktywny")
    print("="*70)
    print("\n  Wpisz URL do sprawdzenia (lub 'quit' aby zakonczyc):\n")

    while True:
        try:
            url = input("  > ").strip()
            if url.lower() in ['quit', 'exit', 'q']:
                break
            if not url:
                continue

            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url

            result = check_url(url)
            if result:
                print_result(result)

        except KeyboardInterrupt:
            print("\n\n  Do widzenia!")
            break
        except Exception as e:
            print(f"  [BLAD] {e}")


def main():
    """Glowna funkcja."""
    if len(sys.argv) > 1:
        url = sys.argv[1]
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        result = check_url(url)
        if result:
            print_result(result)
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
