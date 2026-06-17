from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base

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
    wz_specials = relationship("WZ_special", back_populates="user")
    wz_special_contents = relationship("WZ_special_content", back_populates="adding_user")


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
    sender_wz_specials = relationship("WZ_special", back_populates="sender")

class WZ_regular(Base):
    __tablename__ = "wz_regular"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))    
    user = relationship("User", back_populates="wz_regulars")
    sender_id = Column(String(10), ForeignKey("adress.name"))  #chodzi o adress, powinno być name ale za późno na zmiane
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
    wz_regular = relationship("WZ_regular", back_populates="wz_contents")
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

class WZ_special(Base):
    __tablename__ = "wz_special"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="wz_specials")
    sender_id = Column(String(10), ForeignKey("adress.name"))
    sender = relationship("Adress", back_populates="sender_wz_specials")
    recipient = Column(String(255))
    seal_number = Column(String(10))
    car_plates = Column(String(10))
    created_date = Column (DateTime(timezone=True), server_default=func.now(), nullable=False)
    departure_date = Column(DateTime(timezone=True))
    wz_approval = Column(Boolean, default=False)
    approver = Column(String(100))
    wz_contents = relationship("WZ_special_content", back_populates="wz_special")

class WZ_special_content(Base):
    __tablename__ = "wz_special_content"

    id = Column(Integer, primary_key=True, index=True)
    wz_id = Column(Integer, ForeignKey("wz_special.id"))
    wz_special = relationship("WZ_special", back_populates="wz_contents")
    adding_user_id = Column(Integer, ForeignKey("users.id"))
    adding_user = relationship(
        "User",
        foreign_keys=[adding_user_id],
        back_populates="wz_special_contents",
    )
    content_description = Column(String(255))