from datetime import datetime


def calculate_relative_time(
    start_time: datetime,
    current_time: datetime,
) -> float:

    difference = (
        current_time - start_time
    ).total_seconds()

    return round(
        max(difference, 0),
        3,
    )


def build_attack_replay(events: list) -> dict:

    if not events:
        return {
            "event_count": 0,
            "duration_seconds": 0,
            "timeline": [],
        }

    ordered_events = sorted(
        events,
        key=lambda event: event.timestamp,
    )

    start_time = ordered_events[0].timestamp

    timeline = []

    for index, event in enumerate(
        ordered_events,
        start=1,
    ):

        timeline.append(
            {
                "sequence": index,
                "event_id": event.id,
                "timestamp": event.timestamp,
                "relative_time_seconds": (
                    calculate_relative_time(
                        start_time,
                        event.timestamp,
                    )
                ),
                "event_type": event.event_type,
                "username": event.username,
                "command": event.command,
                "behavior": event.behavior_category,
                "risk_score": event.risk_score,
                "severity": event.severity,

                "mitre": {
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
        )

    duration = (
        ordered_events[-1].timestamp
        - start_time
    ).total_seconds()

    return {
        "event_count": len(ordered_events),

        "duration_seconds": round(
            max(duration, 0),
            3,
        ),

        "started_at": start_time,

        "ended_at": ordered_events[-1].timestamp,

        "timeline": timeline,
    }