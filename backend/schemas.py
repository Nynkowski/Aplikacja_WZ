from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator, model_validator

class UserLogin(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    id: int
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

class WzRegularContentListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id : int
    content_description : str
    adding_user_id : str
    added_date : datetime

    @model_validator(mode='before')
    @classmethod
    def extract_adding_user_username(cls, values):
        if hasattr(values, 'adding_user') and values.adding_user is not None:
            values.__dict__['adding_user_id'] = values.adding_user.username
        return values

class WzRegularIdEditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id : int
    username : str
    sender_id : str
    recipient_id : str
    seal_number : str
    car_plates : str
    created_date : datetime
    content_list : list[WzRegularContentListResponse]

    @model_validator(mode='before')
    @classmethod
    def extract_related_fields(cls, values):
        if hasattr(values, 'user') and values.user is not None:
            values.__dict__['username'] = values.user.username
        if hasattr(values, 'wz_contents'):
            values.__dict__['content_list'] = values.wz_contents
        return values

class AdressListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name : str
    full_adress : str

class WzRegularContentCreate(BaseModel):
    content_description: str
    adding_user_id: int

class WzRegularCreateRequest(BaseModel):
    user_id: int
    sender_id: str
    recipient_id: str
    seal_number: str
    car_plates: str

    @field_validator("sender_id")
    @classmethod
    def validate_sender_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Miejsce zaladunku jest wymagane")
        return cleaned

    @field_validator("recipient_id")
    @classmethod
    def validate_recipient_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Miejsce rozladunku jest wymagane")
        return cleaned

    @field_validator("seal_number")
    @classmethod
    def validate_seal_number(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Numer plomby jest wymagany")
        return cleaned

    @field_validator("car_plates")
    @classmethod
    def validate_car_plates(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Numer auta jest wymagany")
        return cleaned

class WzRegularCreateResponse(BaseModel):
    id: int

class WzRegularUpdateRequest(BaseModel):
    sender_id: str
    recipient_id: str
    seal_number: str
    car_plates: str

    @field_validator("seal_number")
    @classmethod
    def validate_seal_number(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Numer plomby jest wymagany")
        if not cleaned.isdigit():
            raise ValueError("Numer plomby moze zawierac tylko cyfry")
        return cleaned

    @field_validator("car_plates")
    @classmethod
    def validate_car_plates(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Numer auta jest wymagany")
        return cleaned

class WzRegularContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id : int
    wz_id : int
    content_description : str
    adding_user_id : str
    added_date : datetime

    @model_validator(mode='before')
    @classmethod
    def extract_adding_user_username(cls, values):
        if hasattr(values, 'adding_user') and values.adding_user is not None:
            values.__dict__['adding_user_id'] = values.adding_user.username
        return values

class WzRegularContentDeleteResponse(BaseModel):
    message: str = "Deleted"
    wz_id: int
    content_id: int
