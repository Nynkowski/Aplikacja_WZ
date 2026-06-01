from sqlalchemy.orm import Session


try:
	from . import models, auth
except ImportError:
	import models, auth


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