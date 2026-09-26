from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class HoneypotEvent(BaseModel):

    event_id: Optional[str] = None

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    source_ip: str

    service: str

    event_type: str

    username: Optional[str] = None

    command: Optional[str] = None

    severity: str = "low"

    description: Optional[str] = None