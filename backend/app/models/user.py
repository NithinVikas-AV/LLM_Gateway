# User table

import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    role = Column(String, default="employee")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    provider_keys = relationship("ProviderKey", back_populates="user")
    universal_keys = relationship("UniversalKey", back_populates="user")
    usage_logs = relationship("UsageLog", back_populates="user")