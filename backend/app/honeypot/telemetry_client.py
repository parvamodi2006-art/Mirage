import asyncio
from typing import Optional

import requests


class TelemetryClient:

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:8000",
    ):
        self.base_url = base_url.rstrip("/")

    async def create_session(
        self,
        source_ip: str,
        service: str = "ssh",
    ) -> Optional[str]:

        return await asyncio.to_thread(
            self._create_session,
            source_ip,
            service,
        )

    def _create_session(
        self,
        source_ip: str,
        service: str,
    ) -> Optional[str]:

        try:

            response = requests.post(
                f"{self.base_url}/api/telemetry/session",
                params={
                    "source_ip": source_ip,
                    "service": service,
                },
                timeout=5,
            )

            response.raise_for_status()

            return response.json()[
                "session_id"
            ]

        except requests.RequestException as exc:

            print(
                "[Telemetry] "
                f"Session creation failed: {exc}"
            )

            return None

    async def close_session(
        self,
        session_id: str,
    ) -> bool:

        return await asyncio.to_thread(
            self._close_session,
            session_id,
        )

    def _close_session(
        self,
        session_id: str,
    ) -> bool:

        try:

            response = requests.post(
                f"{self.base_url}"
                f"/api/telemetry/session/"
                f"{session_id}/close",
                timeout=5,
            )

            response.raise_for_status()

            result = response.json()

            print(
                "[Telemetry] "
                f"Session closed | "
                f"{result.get('session_id')}"
            )

            return True

        except requests.RequestException as exc:

            print(
                "[Telemetry] "
                f"Session close failed: {exc}"
            )

            return False

    async def send_event(
        self,
        session_id: str,
        source_ip: str,
        event_type: str,
        command: str | None = None,
        username: str | None = None,
        service: str = "ssh",
    ) -> bool:

        return await asyncio.to_thread(
            self._send_event,
            session_id,
            source_ip,
            event_type,
            command,
            username,
            service,
        )

    def _send_event(
        self,
        session_id: str,
        source_ip: str,
        event_type: str,
        command: str | None,
        username: str | None,
        service: str,
    ) -> bool:

        try:

            response = requests.post(
                f"{self.base_url}/api/telemetry/event",
                params={
                    "session_id": session_id,
                },
                json={
                    "source_ip": source_ip,
                    "service": service,
                    "event_type": event_type,
                    "username": username,
                    "command": command,
                },
                timeout=5,
            )

            response.raise_for_status()

            result = response.json()

            behavior = result.get(
                "behavior",
                {},
            )

            print(
                "[Telemetry] "
                f"{event_type} | "
                f"{behavior.get('category')} | "
                f"risk={behavior.get('risk_score')}"
            )

            return True

        except requests.RequestException as exc:

            print(
                "[Telemetry] "
                f"Event submission failed: {exc}"
            )

            return False