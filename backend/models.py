import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from database import Base


class Department(enum.Enum):
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


class YearOfStudy(enum.Enum):
    FIRST = "First Year"
    SECOND = "Second Year"
    THIRD = "Third Year"


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    register_number = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=False)
    department = Column(Enum(Department), nullable=False)
    year_of_study = Column(Enum(YearOfStudy), nullable=False)
    profile_picture = Column(String(500), nullable=True)
    password_hash = Column(String(255), nullable=False)
    referral_code = Column(String(5), unique=True, nullable=False, index=True)
    referred_by = Column(String(5), nullable=True, index=True)
    referral_count = Column(Integer, default=0, nullable=False)
    is_admin = Column(Integer, default=0, nullable=False)  # 0 = user, 1 = admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
