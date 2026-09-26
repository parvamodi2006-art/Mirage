from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone

from .database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)

    # Session
    session_id = Column(String, index=True, nullable=False)

    # Basic telemetry
    source_ip = Column(String, nullable=False)
    service = Column(String, nullable=False)
    event_type = Column(String, nullable=False)

    # User / command
    username = Column(String, nullable=True)
    command = Column(String, nullable=True)

    # Behavior Engine
    behavior_category = Column(String, nullable=True)
    risk_score = Column(Integer, nullable=True)
    severity = Column(String, default="low")

    # MITRE ATT&CK
    mitre_technique_id = Column(String, nullable=True)
    mitre_technique_name = Column(String, nullable=True)
    mitre_tactic = Column(String, nullable=True)

    # Human-readable explanation
    description = Column(String, nullable=True)

    # Event timestamp
    timestamp = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )