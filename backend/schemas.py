from datetime import datetime
from pydantic import BaseModel, ConfigDict, model_validator

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

class WzRegularOpenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    sender_id: str
    recipient_id: str
    seal_number: str
    car_plates: str
    created_date: datetime

    @model_validator(mode='before')
    @classmethod
    def extract_username(cls, values):
        if hasattr(values, 'user') and values.user is not None:
            values.__dict__['username'] = values.user.username
        return values


class WzRegularOpenPageResponse(BaseModel):
    items: list[WzRegularOpenResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class Wz_RegularOpenFilters(BaseModel):
    user_id : str
    sender_id: str
    recipient_id: str
    seal_number: str
    car_plates: str
    created_date: datetime