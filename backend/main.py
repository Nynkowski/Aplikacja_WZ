from fastapi import FastAPI, Depends, HTTPException
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
