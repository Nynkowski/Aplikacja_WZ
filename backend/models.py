from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, func
from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    type = Column(String(10))  # admin / user / security
    wz_regulars = relationship("WZ_regular", back_populates="user")
    added_contents = relationship(
        "WZ_Content",  
        foreign_keys="WZ_Content.adding_user_id",
        back_populates="adding_user",
    )
    accepted_contents = relationship(
        "WZ_Content",
        foreign_keys="WZ_Content.accepting_user_id",
        back_populates="accepting_user",
    )

class Adress(Base):
    __tablename__ = "adress"

    name = Column(String(10), primary_key=True, index=True)
    full_adress =Column(String(255))
    sender_wz_regulars = relationship(
        "WZ_regular",
        foreign_keys="WZ_regular.sender_id",
        back_populates="sender",
    )
    recipient_wz_regulars = relationship(
        "WZ_regular",
        foreign_keys="WZ_regular.recipient_id",
        back_populates="recipient",
    )

class WZ_regular(Base):
    __tablename__ = "wz_regular"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))    
    user = relationship("User", back_populates="wz_regulars")
    sender_id = Column(String(10), ForeignKey("adress.name"))
    sender = relationship(
        "Adress",
        foreign_keys=[sender_id],
        back_populates="sender_wz_regulars",
    )
    recipient_id = Column(String(10), ForeignKey("adress.name"))
    recipient = relationship(
        "Adress",
        foreign_keys=[recipient_id],
        back_populates="recipient_wz_regulars",
    )
    seal_number = Column(String(10))
    car_plates = Column(String(10))
    created_date = Column (DateTime(timezone=True), server_default=func.now(), nullable=False)
    departure_date = Column(DateTime(timezone=True))
    wz_contents = relationship("WZ_Content", back_populates="wz_regular")

class WZ_Content(Base):
    __tablename__ = "wz_content"

    id = Column(Integer, primary_key=True, index=True)
    wz_id = Column(Integer, ForeignKey("wz_regular.id"))
    wz = relationship("WZ_regular", back_populates="contents")
    adding_user_id = Column(Integer, ForeignKey("users.id"))
    adding_user = relationship(
        "User",
        foreign_keys=[adding_user_id],
        back_populates="added_contents",
    )
    accepting_user_id = Column(Integer, ForeignKey("users.id"))
    accepting_user = relationship(
        "User",
        foreign_keys=[accepting_user_id],
        back_populates="accepted_contents",
    )
    added_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    accepted_date = Column(DateTime(timezone=True))
    content_description = Column(String(255))