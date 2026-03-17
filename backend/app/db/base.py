# imports all models for Alembic
# Every model will inherit from this Base. Alembic needs it to detect your tables.

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass