from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from . import schemas, auth, crud, database
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/login', response_model=schemas.LoginResponse)
def login(user_request: schemas.UserLogin, db = Depends(database.get_db)):
    user = crud.get_user_by_username(db, user_request.username)

    if not user or not auth.verify_password(user_request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    return {
        "message": "Login successful",
        "id": user.id,
        "username": user.username,
        "role": user.type,
    }

@app.get('/wz-regular/open', response_model=schemas.WzRegularOpenPageResponse)
def get_open_wz_regular(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    username: Optional[str] = Query(default=None),
    user_id: Optional[str] = Query(default=None, alias="user_id"),
    sender_id: Optional[str] = Query(default=None),
    recipient_id: Optional[str] = Query(default=None),
    seal_number: Optional[str] = Query(default=None),
    car_plates: Optional[str] = Query(default=None),
    created_date: Optional[str] = Query(default=None),
):
    effective_username = username.strip() if username and username.strip() else None
    if not effective_username and user_id and user_id.strip():
        effective_username = user_id.strip()

    items = crud.get_wz_open_regular(
        db, page, page_size, effective_username, sender_id, recipient_id, seal_number, car_plates, created_date
    )
    total = crud.get_wz_open_regular_total(
        db, effective_username, sender_id, recipient_id, seal_number, car_plates, created_date
    )
    total_pages = (total + page_size - 1) // page_size

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

@app.get('/wz-regular/{id}/edit', response_model=schemas.WzRegularIdEditResponse)
def get_wz_regular_by_id(id: int, db: Session = Depends(database.get_db)):
    wz_regular = crud.get_wz_regular_by_id(db, id)
    if wz_regular is None:
        raise HTTPException(status_code=404, detail="WZ regular not found")
    return wz_regular

@app.get('/adresses', response_model=list[schemas.AdressListResponse])
def get_adresses(db: Session = Depends(database.get_db)):
    adresses = crud.get_adresses(db)
    return adresses

@app.post('/wz-regular', response_model=schemas.WzRegularCreateResponse)
def post_wz_regular(
    create_request: schemas.WzRegularCreateRequest,
    db: Session = Depends(database.get_db),
):
    user = crud.get_user_by_id(db, create_request.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    wz_regular = crud.post_wz_regular(
        db,
        user_id=create_request.user_id,
        sender_id=create_request.sender_id,
        recipient_id=create_request.recipient_id,
        seal_number=create_request.seal_number,
        car_plates=create_request.car_plates,
    )

    return {"id": wz_regular.id}

@app.post('/wz-regular/{id}/content', response_model=schemas.WzRegularContentResponse)
def post_wz_content(
    id: int,
    content_request: schemas.WzRegularContentCreate, 
    db: Session = Depends(database.get_db)):
    wz_regular = crud.get_wz_regular_by_id(db, id)
    if wz_regular is None:
        raise HTTPException(status_code=404, detail="WZ regular not found")

    wz_content = crud.post_wz_content(
        db,
        wz_id=id,
        content_description=content_request.content_description,
        adding_user_id=content_request.adding_user_id
    )
    return wz_content

@app.patch('/wz-regular/{id}', response_model=schemas.WzRegularIdEditResponse)
def patch_wz_regular(
    id: int,
    update_request: schemas.WzRegularUpdateRequest,
    db: Session = Depends(database.get_db),
):
    wz_regular = crud.get_wz_regular_by_id(db, id)
    if wz_regular is None:
        raise HTTPException(status_code=404, detail="WZ regular not found")

    if wz_regular.departure_date is not None:
        raise HTTPException(status_code=409, detail="WZ is closed and cannot be edited")

    updated_wz_regular = crud.update_wz_regular(
        db,
        wz_id=id,
        sender_id=update_request.sender_id,
        recipient_id=update_request.recipient_id,
        seal_number=update_request.seal_number,
        car_plates=update_request.car_plates,
    )

    if updated_wz_regular is None:
        raise HTTPException(status_code=404, detail="WZ regular not found")

    return updated_wz_regular

@app.delete('/wz-regular/{id}/content/{content_id}', response_model=schemas.WzRegularContentDeleteResponse)
def delete_wz_content(
    id: int,
    content_id: int,
    db: Session = Depends(database.get_db)):
    wz_regular = crud.get_wz_regular_by_id(db, id)
    if wz_regular is None:
        raise HTTPException(status_code=404, detail="WZ regular not found")

    deleted_content_id = crud.delete_wz_content(db, id, content_id)
    if deleted_content_id is None:
        raise HTTPException(status_code=404, detail="WZ content not found for this WZ")

    return {
        "message": "Deleted",
        "wz_id": id,
        "content_id": deleted_content_id,
    }
