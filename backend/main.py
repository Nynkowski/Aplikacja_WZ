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
