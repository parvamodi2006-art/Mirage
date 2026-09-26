from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone

from .database import Base


class AttackSession(Base):
    __tablename__ = "attack_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    session_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    source_ip = Column(
        String,
        nullable=False,
    )

    service = Column(
        String,
        nullable=False,
    )

    status = Column(
        String,
        default="active",
        nullable=False,
    )

    started_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    ended_at = Column(
        DateTime,
        nullable=True,
    )