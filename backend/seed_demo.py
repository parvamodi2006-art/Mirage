from datetime import datetime, timezone, timedelta
from uuid import uuid4

from backend.app.telemetry.database import SessionLocal, Base, engine
from backend.app.telemetry.db_models import Event
from backend.app.telemetry.session_models import AttackSession
from backend.app.behavior.engine import analyze_event
from backend.app.attack.mitre_mapper import map_behavior_to_mitre


DEMO_SESSION_ID = "mirage-demo-session-001"
DEMO_SOURCE_IP = "192.0.2.10"
DEMO_SERVICE = "ssh"
DEMO_USERNAME = "demo-user"


DEMO_EVENTS = [
    {
        "event_type": "login_attempt",
        "command": None,
        "username": DEMO_USERNAME,
        "description": "Controlled demonstration login activity",
    },
    {
        "event_type": "command_execution",
        "command": "whoami",
        "username": DEMO_USERNAME,
        "description": "Controlled demonstration of system user discovery",
    },
    {
        "event_type": "command_execution",
        "command": "ifconfig",
        "username": DEMO_USERNAME,
        "description": "Controlled demonstration of network discovery",
    },
    {
        "event_type": "command_execution",
        "command": "cat /etc/passwd",
        "username": DEMO_USERNAME,
        "description": "Controlled demonstration of credential-related file access",
    },
    {
        "event_type": "command_execution",
        "command": "sudo -l",
        "username": DEMO_USERNAME,
        "description": "Controlled demonstration of privilege escalation discovery",
    },
    {
        "event_type": "command_execution",
        "command": "bash",
        "username": DEMO_USERNAME,
        "description": "Controlled demonstration of command execution",
    },
]


def main():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        existing_session = (
            db.query(AttackSession)
            .filter(
                AttackSession.session_id
                == DEMO_SESSION_ID
            )
            .first()
        )

        if existing_session:
            print("Demo session already exists.")
            print(f"Session ID: {DEMO_SESSION_ID}")
            return

        started_at = datetime.now(timezone.utc)

        session = AttackSession(
            session_id=DEMO_SESSION_ID,
            source_ip=DEMO_SOURCE_IP,
            service=DEMO_SERVICE,
            status="completed",
            started_at=started_at,
            ended_at=started_at + timedelta(seconds=42),
        )

        db.add(session)
        db.commit()

        for index, item in enumerate(DEMO_EVENTS):
            result = analyze_event(
                event_type=item["event_type"],
                command=item["command"],
            )

            mitre = map_behavior_to_mitre(
                result.category
            )

            event = Event(
                session_id=DEMO_SESSION_ID,
                source_ip=DEMO_SOURCE_IP,
                service=DEMO_SERVICE,
                event_type=item["event_type"],
                username=item["username"],
                command=item["command"],
                behavior_category=result.category,
                risk_score=result.risk_score,
                severity=result.severity,
                mitre_technique_id=(
                    mitre.technique_id
                    if mitre
                    else None
                ),
                mitre_technique_name=(
                    mitre.technique_name
                    if mitre
                    else None
                ),
                mitre_tactic=(
                    mitre.tactic
                    if mitre
                    else None
                ),
                description=item["description"],
                timestamp=(
                    started_at
                    + timedelta(seconds=index * 7)
                ),
            )

            db.add(event)

        db.commit()

        print()
        print("========================================")
        print("      MIRAGE DEMO DATA SEEDED")
        print("========================================")
        print()
        print(f"Session ID : {DEMO_SESSION_ID}")
        print(f"Events     : {len(DEMO_EVENTS)}")
        print("Service    : ssh")
        print("Source IP  : 192.0.2.10")
        print()
        print("Demo attack flow:")
        print("Initial Access")
        print("      ↓")
        print("Discovery")
        print("      ↓")
        print("Credential Access")
        print("      ↓")
        print("Privilege Escalation")
        print("      ↓")
        print("Execution")
        print()
        print("Demo data inserted successfully.")
        print("========================================")

    except Exception as exc:
        db.rollback()
        print()
        print("ERROR:")
        print(exc)

    finally:
        db.close()


if __name__ == "__main__":
    main()