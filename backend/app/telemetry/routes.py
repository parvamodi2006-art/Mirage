from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .models import HoneypotEvent
from .database import SessionLocal
from .db_models import Event
from .session_models import AttackSession

from backend.app.behavior.engine import analyze_event
from backend.app.attack.mitre_mapper import map_behavior_to_mitre
from backend.app.attack.risk_engine import calculate_session_risk
from backend.app.attack.attack_stage import (
    build_attack_progression,
)
from backend.app.attack.replay import (
    build_attack_replay,
)


router = APIRouter(
    prefix="/api/telemetry",
    tags=["Telemetry"],
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# CREATE ATTACK SESSION
# ============================================================

@router.post("/session")
def create_session(
    source_ip: str,
    service: str,
    db: Session = Depends(get_db),
):

    session_id = str(uuid4())

    attack_session = AttackSession(
        session_id=session_id,
        source_ip=source_ip,
        service=service,
        status="active",
    )

    db.add(attack_session)
    db.commit()
    db.refresh(attack_session)

    return {
        "status": "created",
        "session_id": session_id,
        "source_ip": source_ip,
        "service": service,
        "session_status": "active",
    }


# ============================================================
# CLOSE ATTACK SESSION
# ============================================================

@router.post("/session/{session_id}/close")
def close_session(
    session_id: str,
    db: Session = Depends(get_db),
):

    session = (
        db.query(AttackSession)
        .filter(
            AttackSession.session_id
            == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Attack session not found",
        )

    if session.status != "completed":

        session.status = "completed"

        session.ended_at = (
            datetime.now(timezone.utc)
        )

        db.commit()
        db.refresh(session)

    return {
        "status": "closed",
        "session_id": session.session_id,
        "session_status": session.status,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
    }


# ============================================================
# CREATE TELEMETRY EVENT
# ============================================================

@router.post("/event")
def create_event(
    event: HoneypotEvent,
    session_id: str,
    db: Session = Depends(get_db),
):

    session = (
        db.query(AttackSession)
        .filter(
            AttackSession.session_id == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Attack session not found",
        )

    behavior = analyze_event(
        event_type=event.event_type,
        command=event.command,
        username=event.username,
    )

    mitre = map_behavior_to_mitre(
        behavior.category
    )

    db_event = Event(
        session_id=session_id,
        source_ip=event.source_ip,
        service=event.service,
        event_type=event.event_type,
        username=event.username,
        command=event.command,
        behavior_category=behavior.category,
        risk_score=behavior.risk_score,
        severity=behavior.severity,

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

        description=(
            event.description
            if event.description
            else behavior.explanation
        ),

        timestamp=event.timestamp,
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return {
        "status": "stored",
        "event_id": db_event.id,
        "session_id": session_id,

        "behavior": {
            "category": behavior.category,
            "risk_score": behavior.risk_score,
            "severity": behavior.severity,
            "explanation": behavior.explanation,
        },

        "mitre_attack": (
            {
                "technique_id": mitre.technique_id,
                "technique_name": mitre.technique_name,
                "tactic": mitre.tactic,
                "description": mitre.description,
            }
            if mitre
            else None
        ),

        "message": (
            "Honeypot event analyzed, "
            "mapped to MITRE ATT&CK, "
            "and stored successfully"
        ),
    }


# ============================================================
# GET ALL EVENTS
# ============================================================

@router.get("/events")
def get_events(
    db: Session = Depends(get_db),
):

    events = (
        db.query(Event)
        .order_by(Event.timestamp.desc())
        .all()
    )

    return {
        "count": len(events),

        "events": [
            {
                "id": event.id,
                "session_id": event.session_id,
                "source_ip": event.source_ip,
                "service": event.service,
                "event_type": event.event_type,
                "username": event.username,
                "command": event.command,

                "behavior_category": (
                    event.behavior_category
                ),

                "risk_score": event.risk_score,
                "severity": event.severity,

                "mitre_attack": {
                    "technique_id": (
                        event.mitre_technique_id
                    ),
                    "technique_name": (
                        event.mitre_technique_name
                    ),
                    "tactic": event.mitre_tactic,
                },

                "description": event.description,
                "timestamp": event.timestamp,
            }

            for event in events
        ],
    }


# ============================================================
# GET ALL ATTACK SESSIONS
# ============================================================

@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
):

    sessions = (
        db.query(AttackSession)
        .order_by(
            AttackSession.started_at.desc()
        )
        .all()
    )

    result = []

    for session in sessions:

        events = (
            db.query(Event)
            .filter(
                Event.session_id
                == session.session_id
            )
            .order_by(
                Event.timestamp.asc()
            )
            .all()
        )

        risk = calculate_session_risk(events)

        result.append(
            {
                "id": session.id,

                "session_id": (
                    session.session_id
                ),

                "source_ip": session.source_ip,

                "service": session.service,

                "status": session.status,

                "started_at": (
                    session.started_at
                ),

                "ended_at": (
                    session.ended_at
                ),

                "event_count": len(events),

                "risk": {
                    "score": risk.score,
                    "severity": risk.severity,
                    "threat_level": (
                        risk.threat_level
                    ),
                },
            }
        )

    return {
        "count": len(result),
        "sessions": result,
    }


# ============================================================
# GET SINGLE ATTACK SESSION
# ============================================================

@router.get("/sessions/{session_id}")
def get_session_details(
    session_id: str,
    db: Session = Depends(get_db),
):

    session = (
        db.query(AttackSession)
        .filter(
            AttackSession.session_id
            == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Attack session not found",
        )

    events = (
        db.query(Event)
        .filter(
            Event.session_id
            == session_id
        )
        .order_by(
            Event.timestamp.asc()
        )
        .all()
    )

    risk = calculate_session_risk(events)

    progression = build_attack_progression(
        events
    )

    return {
        "session": {
            "session_id": (
                session.session_id
            ),
            "source_ip": session.source_ip,
            "service": session.service,
            "status": session.status,
            "started_at": (
                session.started_at
            ),
            "ended_at": (
                session.ended_at
            ),
        },

        "intelligence": {
            "event_count": len(events),

            "risk": {
                "score": risk.score,
                "severity": risk.severity,
                "threat_level": (
                    risk.threat_level
                ),
                "explanation": (
                    risk.explanation
                ),
            },

            "attack_progression": progression,
        },

        "timeline": [
            {
                "event_id": event.id,
                "timestamp": event.timestamp,
                "event_type": event.event_type,
                "username": event.username,
                "command": event.command,

                "behavior_category": (
                    event.behavior_category
                ),

                "risk_score": event.risk_score,
                "severity": event.severity,

                "mitre_attack": {
                    "technique_id": (
                        event.mitre_technique_id
                    ),
                    "technique_name": (
                        event.mitre_technique_name
                    ),
                    "tactic": event.mitre_tactic,
                },

                "description": event.description,
            }

            for event in events
        ],
    }


# ============================================================
# ATTACK REPLAY
# ============================================================

@router.get(
    "/sessions/{session_id}/replay"
)
def get_attack_replay(
    session_id: str,
    db: Session = Depends(get_db),
):

    session = (
        db.query(AttackSession)
        .filter(
            AttackSession.session_id
            == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Attack session not found",
        )

    events = (
        db.query(Event)
        .filter(
            Event.session_id
            == session_id
        )
        .order_by(
            Event.timestamp.asc()
        )
        .all()
    )

    replay = build_attack_replay(events)

    risk = calculate_session_risk(events)

    progression = build_attack_progression(
        events
    )

    return {
        "replay": {
            "session_id": session_id,

            "source_ip": (
                session.source_ip
            ),

            "service": session.service,

            "risk": {
                "score": risk.score,
                "severity": risk.severity,
                "threat_level": (
                    risk.threat_level
                ),
            },

            "attack_progression": progression,

            **replay,
        }
    }