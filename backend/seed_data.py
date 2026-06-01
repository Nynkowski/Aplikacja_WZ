import random
from pathlib import Path
import sys

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import crud
    from database import SessionLocal
else:
    from . import crud
    from .database import SessionLocal

def seed_users():
    db = SessionLocal()
    try:
        crud.post_user(db, username="Bubik.Bubikowski@bubikon.com", password="bubik123", type="admin")
        crud.post_user(db, username="Papruchowski.Papruch@bubikon.com", password="123", type="security")
        crud.post_user(db, username="PracowityJelen@bubikon.com", password="Robocze21", type="user")
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error seeding users: {e}")
    finally:
        db.close()

def seed_adresses():
    db = SessionLocal()
    try:
        crud.post_adress(db, name="BZJ", full_adress="Bubikowskie Żebranie Jedzenia, ul. Bubikowa 7, 71-531 Bubukowo")
        crud.post_adress(db, name="ZEZR", full_adress="Zjednoczone Emiraty Zbiorów Resztek, ul Resztek 11, 81-612 Śmietnisko")
        crud.post_adress(db, name="MZP", full_adress="Miejsce Zbierania Papróchów, plac Zbawiciela 1, 12-912 Rów pod barem 'Basieńka'")
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error seeding adresses: {e}")
    finally:
        db.close()

def seed_wz_regulars():
    db = SessionLocal()
    try:
        for i in range(10000): #dużo wpisów aby przetestować wydajność aplikacji
            user_id = random.randint(1, 3)
            sender_id = random.choice(["BZJ", "ZEZR", "MZP"])
            recipient_id = random.choice(["BZJ", "ZEZR", "MZP"])
            while recipient_id == sender_id:
                recipient_id = random.choice(["BZJ", "ZEZR", "MZP"])
            seal_number = i + 1
            plate_number = f"BB{random.randint(1000, 9999)}"
            wz_regular =crud.post_wz_regular(db, user_id=user_id, sender_id=sender_id, recipient_id=recipient_id, seal_number=str(seal_number), car_plates=plate_number)
            liczba_wpisow = random.randint(1, 5) 
            
            for j in range(liczba_wpisow):
                try:
                    content_description = ["Kosci", "Smaczki", "Papruchy", "Resztki, ale dobre", "Rozum i Godnosc"]
                    crud.post_wz_content(db, wz_id=wz_regular.id, adding_user_id=user_id, content_description=random.choice(content_description))
                except Exception as e:
                    db.rollback()
                    raise RuntimeError(f"Error seeding wz_content: {e}")

    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error seeding wz_regulars: {e}")
    finally:
        db.close()

def seed_wz_specials():
    db = SessionLocal()
    try:
        for i in range(100):
            user_id = random.randint(1, 3)
            sender_id = random.choice(["BZJ", "ZEZR", "MZP"])
            recipient_id = random.choice(["BZJ", "ZEZR", "MZP"])
            while recipient_id == sender_id:
                recipient_id = random.choice(["BZJ", "ZEZR", "MZP"])
            seal_number = i + 1
            plate_number = f"BSS{random.randint(1000, 9999)}"
            approver = random.choice(["Zatwierdzajacy.Manager@bubikon.com", "Boss.Szefu@bubikon.com", "Kierownik.Zloty@bubikon.com"])
            wz_special = crud.post_wz_special(db, user_id=user_id, sender_id=sender_id, recipient=recipient_id, seal_number=str(seal_number), car_plates=plate_number, approver=approver)
            try:
                content_description = ["Zloto", "Srebro", "Rybyt", "Kuny", "Ploteczki"]
                crud.post_wz_special_content(db, wz_id=wz_special.id, adding_user_id=user_id, content_description=random.choice(content_description))
            except Exception as e:
                    db.rollback()
                    raise RuntimeError(f"Error seeding wz_special_content: {e}")
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error seeding wz_specials: {e}")
    finally:
        db.close()
            
if __name__ == "__main__":
    seed_users()
    seed_adresses()
    seed_wz_regulars()
    seed_wz_specials()
    print("Seedy skonczone.")
