from dataclasses import dataclass


@dataclass
class SessionRisk:
    score: int
    severity: str
    threat_level: str
    explanation: str


def calculate_severity(score: int) -> str:

    if score >= 85:
        return "critical"

    if score >= 65:
        return "high"

    if score >= 35:
        return "medium"

    return "low"


def calculate_session_risk(events: list) -> SessionRisk:

    if not events:
        return SessionRisk(
            score=0,
            severity="low",
            threat_level="benign",
            explanation="No attack activity has been recorded.",
        )

    scores = [
        event.risk_score or 0
        for event in events
    ]

    highest_score = max(scores)
    average_score = sum(scores) / len(scores)

    categories = {
        event.behavior_category
        for event in events
        if event.behavior_category
    }

    diversity_bonus = min(
        len(categories) * 5,
        20,
    )

    critical_events = sum(
        1
        for event in events
        if event.severity == "critical"
    )

    critical_bonus = min(
        critical_events * 8,
        24,
    )

    high_events = sum(
        1
        for event in events
        if event.severity == "high"
    )

    high_bonus = min(
        high_events * 4,
        16,
    )

    raw_score = (
        (highest_score * 0.45)
        + (average_score * 0.20)
        + diversity_bonus
        + critical_bonus
        + high_bonus
    )

    score = min(
        round(raw_score),
        100,
    )

    severity = calculate_severity(score)

    if score >= 85:
        threat_level = "critical"

    elif score >= 65:
        threat_level = "high"

    elif score >= 35:
        threat_level = "medium"

    else:
        threat_level = "low"

    if critical_events >= 2:

        explanation = (
            "The session contains multiple critical-risk "
            "behaviors indicating a potentially aggressive "
            "attack sequence."
        )

    elif critical_events == 1:

        explanation = (
            "The session contains critical-risk activity "
            "requiring investigation."
        )

    elif high_events >= 2:

        explanation = (
            "Multiple high-risk behaviors were observed "
            "during the attack session."
        )

    elif highest_score >= 60:

        explanation = (
            "The session contains suspicious behavior "
            "associated with active reconnaissance or "
            "system interaction."
        )

    else:

        explanation = (
            "The session contains limited suspicious activity."
        )

    return SessionRisk(
        score=score,
        severity=severity,
        threat_level=threat_level,
        explanation=explanation,
    )