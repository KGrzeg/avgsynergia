# AvgSynergia
Automatyczne liczenie średniej ocen na portalu [synergia.librus.pl](https://synergia.librus.pl) z uwzględnieniem wag dla uczniów szkół, które wyłączyły tę funkcjonalność.

Aplikacja została wyprodukowana z myślą o przeglądarce [Google Chrome](https://www.google.pl/chrome/browser/desktop/index.html) i z nią działa bezbłędnie. Wsparcie dla innych przeglądarek może zostanie wprowadzone  w przyszłości.


# instalacja
## TamperMonkey
   [Tampermonkey](https://tampermonkey.net/) to świetne narzędzie, które pozwala tworzyć dodatki do przeglądarek WWW. Czym się różni od "normalnego" dodatku? Stworzony raz działa na kilku przeglądarkach (budowa pluginu do np. chrome i firefoxa to dwa różne światy), oraz jest darmowy. Za umieszczenie dodatku w sklepie google należy zapłacić.
   Aby zainstalować AvgSynergia należy:
   

 1. zainstalować wspominany dodatek ([Tampermonkey](https://tampermonkey.net/))
 2. otworzyć [ten link](https://github.com/GrzegorzKu/avgsynergia/raw/master/dist/tamper.user.js); za jego pomocą można zainstalować lub ręcznie zaktualizować dodatek
 
Od tej chwili, dodatek będzie się zawsze automatycznie załączał, gdy odwiedzisz stronę ocen w portalu Librus

## Bookmarklet
Drugi sposób na "zainstalowanie" aplikacji, to utworzenie zakładki w przeglądarce.
Nazwa zakładki jest dowolna, natomiast jej adres URL musi mieć następującą treść:
```
javascript:(function(){var%20s=document.createElement(%22script%22);document.body.appendChild(s),s.src=%22https://rawgit.com/GrzegorzKu/avgsynergia/master/dist/bookmarklet.js%22})()
```
Naciskając przycisk zakładki w trakcie przeglądania ocen na stronie librus, uruchamiamy skrypt. W ten sposób nie trzeba instalować niczego w przeglądarce, jednak, program nie będzie się załączał automatycznie. Trzeba nacisnąć przycisk za każdym razem. To rozwiązanie powoduje pobranie kodu jednorazowo w chwili naciśnięcia przycisku (zakładki) oraz natychmiastowe jego usunięcie w momencie odświeżenia strony.

# Licencja
Licencja MIT
Copyright (c) 2017 Grzegorz Kupczyk kupczykgrzeg@gmail.com

Niniejszym gwarantuje się, bez opłat, że każda osoba która wejdzie w posiadanie kopii tego
oprogramowania i związanych z nim plików dokumentacji (dalej „Oprogramowanie”) może
wprowadzać do obrotu Oprogramowanie bez żadnych ograniczeń, w tym bez ograniczeń
prawa do użytkowania, kopiowania, modyfikowania, łączenia, publikowania,
dystrybuowania, sublicencjonowania i/lub sprzedaży kopii Oprogramowania a także
zezwalania osobie, której Oprogramowanie zostało dostarczone czynienia tego samego.

Powyższa nota zastrzegająca prawa autorskie oraz niniejsza nota zezwalająca muszą zostać
włączone do wszystkich kopii lub istotnych części Oprogramowania.

OPROGRAMOWANIE JEST DOSTARCZONE TAKIM, JAKIE JEST, BEZ JAKIEJKOLWIEK GWARANCJI,
WYRAŹNEJ LUB DOROZUMIANEJ, NIE WYŁĄCZAJĄC GWARANCJI PRZYDATNOŚCI HANDLOWEJ LUB
PRZYDATNOŚCI DO OKREŚLONYCH CELÓW A TAKŻE BRAKU WAD PRAWNYCH. W ŻADNYM
PRZYPADKU TWÓRCA LUB POSIADACZ PRAW AUTORSKICH NIE MOÆE PONOSIĆ
ODPOWIEDZIALNOŚCI Z TYTUŁU ROSZCZEŃ LUB WYRZĄDZONEJ SZKODY A TAKŻE ŻADNEJ INNEJ
ODPOWIEDZIALNOŚCI CZY TO WYNIKAJĄCEJ Z UMOWY, DELIKTU, CZY JAKIEJKOLWIEK INNEJ
PODSTAWY POWSTAŁEJ W ZWIĄZKU 