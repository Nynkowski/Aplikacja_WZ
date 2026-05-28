from pathlib import Path
import sys


if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from backend import database, models
else:
    from . import database, models


def create_database():
    models.Base.metadata.create_all(bind=database.engine)


if __name__ == "__main__":
    create_database()
    print("Database tables created.")