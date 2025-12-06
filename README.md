# whattodoapp
# README.md

## Opis aplikacji
Aplikacja **What Todo App** to prosta publiczna lista zadań (CRUD), działająca w przeglądarce.  
Umożliwia użytkownikom dodawanie, edytowanie, usuwanie oraz przeglądanie wspólnych zadań widocznych dla wszystkich użytkowników w czasie rzeczywistym.

Dane są zapisywane w:
- chmurze (**Supabase – PostgreSQL**),
- lokalnie w przeglądarce (**localStorage**).

Aplikacja działa bez backendu (bez Node.js, bez serwera).

---

## Główne funkcjonalności
- Dodawanie nowych zadań.
- Edycja istniejących zadań.
- Usuwanie zadań.
- Paginacja listy zadań.
- Publiczna lista widoczna dla wszystkich użytkowników.
- Synchronizacja danych z chmurą Supabase.
- Działanie offline dzięki localStorage.
- Responsywny interfejs użytkownika.

---

## Technologie użyte w projekcie
- Frontend: **HTML, CSS, JavaScript (Vanilla JS)**
- Backend: **Brak (aplikacja działa bez serwera)**
- Baza danych: **Supabase (PostgreSQL + REST API)**
- Hosting: **Vercel**

---

## Widoki
1. **Lista zadań** – wyświetlanie wszystkich zadań.
2. **Dodawanie zadania** – pole tekstowe i przycisk dodawania.
3. **Edycja zadania** – możliwość zmiany treści zadania.
4. **Usuwanie zadania** – usuwanie zadania z listy.
5. **Paginacja** – przełączanie stron zadań.

---

## Scenariusze użytkownika
1. **Dodawanie zadania**
   - Użytkownik wpisuje treść zadania.
   - Kliknięcie „Add Task” zapisuje zadanie w bazie Supabase.

2. **Przeglądanie zadań**
   - Użytkownik otwiera aplikację.
   - Wyświetlana jest lista publicznych zadań.

3. **Edycja zadania**
   - Użytkownik klika przycisk „Edit”.
   - Zmienia treść zadania i zapisuje zmiany.

4. **Usuwanie zadania**
   - Użytkownik klika przycisk „Delete”.
   - Zadanie zostaje usunięte z bazy danych.

---

## Architektura
Aplikacja działa w modelu **klient – chmura**:
- Frontend obsługuje interfejs użytkownika.
- Supabase udostępnia publiczne API REST.
- Dane są przechowywane w bazie PostgreSQL w chmurze.
- Dodatkowo dane są buforowane lokalnie w localStorage.

---

## Endpointy API (Supabase REST)
| URL | Metoda | Opis |
|-----|--------|------|
| `/rest/v1/whattodoapp` | GET | Pobranie wszystkich zadań |
| `/rest/v1/whattodoapp` | POST | Dodanie nowego zadania |
| `/rest/v1/whattodoapp?id=eq.X` | UPDATE | Edycja zadania |
| `/rest/v1/whattodoapp?id=eq.X` | DELETE | Usunięcie zadania |

---

## Model danych

### Zadanie (Task)
- `id` (int, unikalny, auto increment)
- `text` (string)

---

## Instrukcja uruchomienia lokalnie
1. Sklonuj repozytorium:  
   ```bash
   git clone <link_do_repo>
   Przejdź do katalogu projektu:

cd <nazwa_projektu>


Otwórz plik index.html w przeglądarce.
✅ Gotowe — nie jest wymagany żaden serwer ani instalacja pakietów.

Hosting

Aplikacja hostowana na: Vercel

Publiczny adres aplikacji:

https://whattodoapp.vercel.app/
