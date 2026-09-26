from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class HoneypotSession:
    session_id: str
    source_ip: str
    username: Optional[str] = None
    service: str = "ssh"

    started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    commands: list[str] = field(
        default_factory=list
    )

    authenticated: bool = False

    def record_command(self, command: str) -> None:
        command = command.strip()

        if command:
            self.commands.append(command)

    @property
    def command_count(self) -> int:
        return len(self.commands)