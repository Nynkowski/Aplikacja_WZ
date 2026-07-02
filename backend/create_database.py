from pathlib import Path
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url


from . import database, models


def create_database():
    db_url = make_url(database.CREATE_DATABASE_URL)

    if db_url.get_backend_name().startswith("mysql") and db_url.database:
        admin_url = db_url.set(database="mysql")
        admin_engine = create_engine(admin_url)
        db_name = db_url.database.replace("`", "``")
        with admin_engine.begin() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
        admin_engine.dispose()

    models.Base.metadata.create_all(bind=database.creation_engine)

    if db_url.get_backend_name().startswith("mysql") and db_url.database:
        with database.creation_engine.begin() as conn:
            conn.execute(text("DROP PROCEDURE IF EXISTS ZatwierdzWzSpecial"))
            conn.execute(
                text(
                    """
                    CREATE PROCEDURE ZatwierdzWzSpecial(
                        IN p_wz_id INT,
                        IN p_approver VARCHAR(255)
                    )
                    BEGIN
                        UPDATE wz_special
                        SET wz_approval = TRUE,
                            approver = p_approver
                        WHERE id = p_wz_id;
                    END
                    """
                )
            )


if __name__ == "__main__":
    create_database()
    print("Database tables created.")