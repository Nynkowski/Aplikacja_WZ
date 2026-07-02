


# Wprowadzenie
Projekt został zrobiony na potrzeby zaliczenia ćwiczeń z Systemów baz danych. Jest on prostą aplikacją webową do zarządzania WZ transportowymi.
## Spis treści
* [Wymagania](#Wymagania)
* [Uruchomienie Projektu](#Uruchomienie-projektu)
* [Baza danych](#Baza-danych)
* [Reszta wymagań](#Reszta-wymagań)


## Wymagania
Aby uruchomić aplikacje w systemie Windows, potrzebne są zainstalowane:
* [Python ](https://www.python.org/downloads/windows/)
* [Node.js](https://nodejs.org/en/download)
* [Docker desktop](https://www.docker.com/products/docker-desktop/)

Do podglądu bazy danych:
* [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
## Uruchomienie projektu
### Pierwsze uruchomienie
Za pierwszym razem wymagane jest wykonanie 3 kroków, które wykonujemy po pobraniu repozytorium
#### Krok 1: Stworzenie kontenera Docker
W folderze docker server odpalamy terminal i wpisujemy polecenie:

`docker compose up`

Tworzy on obraz MySQL, z przykładowym użytkownikiem `Bubikowski`, bazą danych `Wystawianie_WZ`.  Za pomocą skryptu init.sql nadaje on użytkownikowi pełną kontrolę nad bazą danych.


#### Krok 2: Instalacja potrzebnych pakietów frontend
Frontend jest napisany w JavaScript za pomocą biblioteki React. Używamy również biblioteki Axios. Instalujemy to wszystko za pomocą terminala w folderze frontend

`npm install`

#### Krok 3: Instalacja potrzebnych pakietów backend
Backend jest napisany w języku python za pomocą frameworku FastApi. W folderze backend odpalamy terminal oraz robimy wirtualne środowisko;

`python -m venv venv`

Następnie je uruchamiamy

`.venv\Scripts\Activate.ps1` lub `.venv\Scripts\activate.bat`

Po czym instalujemy potrzebne pakiety

`pip install -r requirements.txt`

#### Krok 4: 

Ostatnim krokiem jest stworzenie bazy danych na podstawie modelu z pliku `models.py`. Gdy mamy odpalone wirtualne środowisko musimy przejść do folderu głównego projektu, w przypadku poprzedniego kroku:
`cd ..`

Opalamy skrypt który tworzy bazę danych:

`python -m backend.create_database`

Gdy już ją mamy gotową, odpalamy skrypt który wrzuca nam testowe dane. Z racji ilości wpisów do bazy danych może to potrwać kilka minut

`python -m backend.seed_data`

### Uruchomienie aplikacji

#### Frontend

Uruchomiamy go z terminala w folderze frontend:

`npm run` lub `npm run dev`

#### Backend

Uruchomiamy go z wirtualnego środowiska w folderze głównym

`.\backend\.venv\Scripts\Activate.ps1` lub `.\backend\.venv\Scripts\activate.bat`

`uvicorn backend.main:app --reload`

## Baza danych

Do bazy danych możemy się połączyć za pomocą MySQL Workbench - wpisując:
* Connection Name : `Wystawianie_WZ`
* port: `3308` 
* Użytkownik : `Bubikowski`  hasło: `Robocze21`


Poniżej szczegółowo opisze wymagania projektowe na zaliczenie.
### 1.Zaprojektowana i zaimplementowana baza danych
Graficzny model bazy danych znajduje się w pliku `Model bazy danych.png`, zaprojektowana jest przy pomocy sqlalchemy w folderze `backend`, w pliku `models.py` i zaimplementowana przy pomocy skryptu `create_database`
### 2.Wymagania minimalne: 
* co najmniej 3 tabele -  w `models.py`
  * (9-28) `class User(Base):
    __tablename__ = "users" ...`
   * (31-46) `class Adress(Base):
    __tablename__ = "adress ..."`
    * (48-70) `class WZ_regular(Base):
    __tablename__ = "wz_regular" ...`
 * poprawne relacje (klucze główne i obce) - w `models.py`
   *  Na przykładzie tabeli `"users"` - klucz główny jest w lini 34  `name = Column(String(10), primary_key=True, index=True)`
   * w lini 46 ` sender_wz_specials = relationship("WZ_special", back_populates="sender")` oraz 101 `  sender = relationship("Adress", back_populates="sender_wz_specials")` mamy przykład relacji one-to-many pomiędzy adresami a wydaniami specjalnymi, klucz obcy zdefiniowany jest w lini 100 `sender_id = Column(String(10), ForeignKey("adress.name"))`
  * spójność danych (ograniczenia NOT NULL, UNIQUE) - w `models.py` mamy kilka przykładów:
    * `username` w tabeli `users` musi być unikatowy (13) ` username = Column(String(100), unique=True, index=True)`  
    * `created_date` w tabeli `wz_special` nie może być pusty (105) `created_date = Column (DateTime(timezone=True), server_default=func.now(), nullable=False)`
   * dane przykładowe - w `seed_data.py` wrzucamy do bazy danych
     * 3 użytkowników 
     * 3 adresy 
     * 10 000 regularnych wpisów WZ, w każdym z nich od 1 do 5 wierszy zawartości
     * 100 specjalnych WZ, w każdym z nich 1 wiersz z zawartością
### Zapytania SQL
Zapytania są zdefiniowane w pliku `crud.py`
* SELECT 
   * (9-10) pojedyńcze wyszukiwanie `username` w tabeli `user`
     `def get_user_by_username(db: Session, username: str):
	return db.query(models.User).filter(models.User.username == username).first()`
* INSERT
  * (23-28) wstawianie `name` oraz `full_adress` do tabeli `adress`
 `def post_adress(db: Session, name: str, full_adress: str):`
	`db_adress = models.Adress(name=name, full_adress=full_adress)`
	`db.add(db_adress) ...`
* DELETE
  * (220-234) usuwanie wiersza z tabeli `wz_content` 
  `def delete_wz_content(db: Session, wz_id: int, content_id: int):`
	`wz_content = (`
		`db.query(models.WZ_Content)`
		`.filter(`
		`	models.WZ_Content.id == content_id,`
		`	models.WZ_Content.wz_id == wz_id,).first())`
`	if wz_content:`
	`	deleted_content_id = wz_content.id`
	`	db.delete(wz_content)`
		`db.commit()`
	`	return deleted_content_id`
`	return None`
### Elementy zaawansowane
 W `create_database.py` jest tworzona procedura (24-42) `ZatwierdzWzSpecial` zmieniająca `wz_approval` na `True`, dodaje osobę zatwierdzającą `approver` 

Na chwilę obecną procedura jest dostępna w bazie danych ale nie jest wykorzystywana (TBD).

## Reszta wymagań
### Postman 
Przykładowe zapytanie będzie pokazane podczas prezentacji projektu
### Wymagania techniczne 
* hashowanie haseł - w pliku `auth.py` hashujemy hasła z pomocą biblioteki passlib.context 
  `pwd_context = CryptContext(schemes=["argon2"], deprecated='auto')`
  `def hash_password(password: str):
    return pwd_context.hash(password)`
* walidacja danych po stronie backendu - na przykład w pliku `schemas.py` (123-129) używamy dekoratora Pydantic aby  `seal_number` był najperw wyczyszczony z białych znaków z obu stron, oraz w przypadku pustego tekstu wyrzuca błąd `ValueError`
 `@field_validator("seal_number")`
 `@classmethod`
    `def validate_seal_number(cls, value: str) -> str:`
     `   cleaned = value.strip()`
      `  if not cleaned:`
      `      raise ValueError("Numer plomby jest wymagany")`
   `     return cleaned`
 * poprawne zapytania do bazy - znajdują  się w `crud.py`
 * Konta testowe
  Są 3 konta testowe z różnymi rolami:
   * `admin` `Bubik.Bubikowski@bubikon.com` hasło `bubik123`
   * `security` `Papruchowski.Papruch@bubikon.com` hasło `123`
   * `user` `PracowityJelen@bubikon.com` hasło `Robocze21`
