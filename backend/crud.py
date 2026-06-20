from typing import Optional
from datetime import datetime
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, contains_eager
from . import models, auth



def get_user_by_username(db: Session, username: str):
	return db.query(models.User).filter(models.User.username == username).first()

def post_user(db: Session, username: str, password: str, type: str):
	hashed_password = auth.hash_password(password)
	db_user = models.User(username=username, hashed_password=hashed_password, type=type)
	db.add(db_user)
	db.commit()
	db.refresh(db_user)
	return db_user

def post_adress(db: Session, name: str, full_adress: str):
	db_adress = models.Adress(name=name, full_adress=full_adress)
	db.add(db_adress)
	db.commit()
	db.refresh(db_adress)
	return db_adress

def post_wz_regular(
		db: Session, 
		user_id: int, 
		sender_id: str, 
		recipient_id: str,
		seal_number: str,
		car_plates: str
		):
	db_wz_regular = models.WZ_regular(
		user_id=user_id,
		sender_id=sender_id,
		recipient_id=recipient_id,	
		seal_number=seal_number,
		car_plates=car_plates
	)
	db.add(db_wz_regular)
	db.commit()
	db.refresh(db_wz_regular)
	return db_wz_regular

def post_wz_content(db: Session, wz_id: int, adding_user_id: int, content_description: str):
	db_wz_content = models.WZ_Content(wz_id=wz_id, adding_user_id=adding_user_id, content_description=content_description)
	db.add(db_wz_content)
	db.commit()
	db.refresh(db_wz_content)
	return db_wz_content

def post_wz_special(
		db: Session,
		user_id: int,
		sender_id: str,
		recipient: str,
		seal_number: str,
		car_plates: str,
		approver: str
		):
	db_wz_special = models.WZ_special(
		user_id=user_id,
		sender_id=sender_id,
		recipient=recipient,
		seal_number=seal_number,
		car_plates=car_plates,
		wz_approval = False,
		approver = approver
		)
	db.add(db_wz_special)
	db.commit()
	db.refresh(db_wz_special)
	return db_wz_special

def post_wz_special_content(db: Session, wz_id: int, adding_user_id: int, content_description: str):
	db_wz_special_content = models.WZ_special_content(wz_id=wz_id, adding_user_id=adding_user_id, content_description=content_description)
	db.add(db_wz_special_content)
	db.commit()
	db.refresh(db_wz_special_content)
	return db_wz_special_content


def _build_wz_open_regular_query(
		db: Session,
		username: Optional[str] = None,
		sender_id: Optional[str] = None,
		recipient_id: Optional[str] = None,
		seal_number: Optional[str] = None,
		car_plates: Optional[str] = None,
		created_date: Optional[str] = None,
):
	query = (
		db.query(models.WZ_regular)
		.join(models.WZ_regular.user)
		.options(contains_eager(models.WZ_regular.user))
		.filter(models.WZ_regular.departure_date.is_(None))
	)

	if username:
		username_value = username.strip()
		if username_value:
			query = query.filter(models.User.username.ilike(f"%{username_value}%"))
	if sender_id:
		query = query.filter(models.WZ_regular.sender_id.contains(sender_id))
	if recipient_id:
		query = query.filter(models.WZ_regular.recipient_id.contains(recipient_id))
	if seal_number:
		query = query.filter(models.WZ_regular.seal_number.contains(seal_number))
	if car_plates:
		query = query.filter(models.WZ_regular.car_plates.contains(car_plates))
	if created_date:
		date_value = created_date.strip()
		if date_value.isdigit():
			day = int(date_value)
			if 1 <= day <= 31:
				query = query.filter(extract("day", models.WZ_regular.created_date) == day)
		else:
			try:
				parsed_date = datetime.fromisoformat(date_value)
				query = query.filter(func.date(models.WZ_regular.created_date) == parsed_date.date())
			except ValueError:
				query = query.filter(func.date(models.WZ_regular.created_date).contains(date_value))

	return query

def get_wz_open_regular(
		db: Session,
		page: int = 1,
		page_size: int = 20,
		username: Optional[str] = None,
		sender_id: Optional[str] = None,
		recipient_id: Optional[str] = None,
		seal_number: Optional[str] = None,
		car_plates: Optional[str] = None,
		created_date: Optional[str] = None
	):
	query = _build_wz_open_regular_query(
		db,
		username,
		sender_id,
		recipient_id,
		seal_number,
		car_plates,
		created_date,
	)

	return (
		query
		.order_by(models.WZ_regular.created_date.desc(), models.WZ_regular.id.desc())
		.offset((page - 1) * page_size)
		.limit(page_size)
		.all()
	)


def get_wz_open_regular_total(
		db: Session,
		username: Optional[str] = None,
		sender_id: Optional[str] = None,
		recipient_id: Optional[str] = None,
		seal_number: Optional[str] = None,
		car_plates: Optional[str] = None,
		created_date: Optional[str] = None,
):
	query = _build_wz_open_regular_query(
		db,
		username,
		sender_id,
		recipient_id,
		seal_number,
		car_plates,
		created_date,
	)
	return query.count()


