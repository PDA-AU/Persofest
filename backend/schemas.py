from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class DepartmentEnum(str, Enum):
    AI_DS = "Artificial Intelligence and Data Science"
    AERO = "Aerospace Engineering"
    AUTO = "Automobile Engineering"
    CT = "Computer Technology"
    ECE = "Electronics and Communication Engineering"
    EIE = "Electronics and Instrumentation Engineering"
    PT = "Production Technology"
    RA = "Robotics and Automation"
    RPT = "Rubber and Plastics Technology"
    IT = "Information Technology"


class YearOfStudyEnum(str, Enum):
    FIRST = "First Year"
    SECOND = "Second Year"
    THIRD = "Third Year"


class ParticipantCreate(BaseModel):
    name: str
    register_number: str
    email: EmailStr
    phone_number: str
    department: DepartmentEnum
    year_of_study: YearOfStudyEnum
    password: str

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @field_validator('register_number')
    @classmethod
    def register_number_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Register number cannot be empty')
        return v.strip().upper()

    @field_validator('phone_number')
    @classmethod
    def phone_number_valid(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        return v.strip()


class ParticipantUpdate(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None


class ParticipantResponse(BaseModel):
    id: int
    name: str
    register_number: str
    email: str
    phone_number: str
    department: str
    year_of_study: str
    profile_picture: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    register_number: Optional[str] = None


class LoginRequest(BaseModel):
    register_number: str
    password: str
