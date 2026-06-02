import os
import sys
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool



ROOT_DIR = Path(__file__).resolve().parents[1]
PARENT_DIR = ROOT_DIR.parent
if str(PARENT_DIR) not in sys.path:
    sys.path.insert(0, str(PARENT_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("CREATE_DATABASE_URL", "sqlite:///./test_create.db")

from backend import models


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    models.Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        models.Base.metadata.drop_all(bind=engine)
