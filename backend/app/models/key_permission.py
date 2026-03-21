import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class KeyPermission(Base):
    __tablename__ = "key_permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    universal_key_id = Column(UUID(as_uuid=True), ForeignKey("universal_keys.id"), nullable=False)
    model = Column(String, nullable=False)
    rpm_limit = Column(Integer, default=None)
    daily_token_limit = Column(Integer, default=None)
    monthly_cost_limit = Column(Float, default=None)

    universal_key = relationship("UniversalKey", back_populates="permissions")