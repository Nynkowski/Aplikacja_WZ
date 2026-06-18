from pydantic import BaseModel

class UserLogin(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    username: str
    role: str

class UserCreate(BaseModel):
    username: str
    password: str
    type: str