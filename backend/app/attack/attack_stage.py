from dataclasses import dataclass


@dataclass
class AttackStage:
    name: str
    order: int
    description: str


STAGES = {

    "authentication_activity": AttackStage(
        name="Initial Access",
        order=1,
        description=(
            "The attacker is attempting to establish "
            "access to the honeypot."
        ),
    ),

    "system_discovery": AttackStage(
        name="Discovery",
        order=2,
        description=(
            "The attacker is attempting to understand "
            "the target system or user."
        ),
    ),

    "network_discovery": AttackStage(
        name="Discovery",
        order=2,
        description=(
            "The attacker is attempting to discover "
            "network interfaces and connections."
        ),
    ),

    "file_discovery": AttackStage(
        name="Discovery",
        order=2,
        description=(
            "The attacker is enumerating files and "
            "directories."
        ),
    ),

    "credential_access": AttackStage(
        name="Credential Access",
        order=3,
        description=(
            "The attacker is attempting to locate or "
            "access credentials."
        ),
    ),

    "privilege_escalation": AttackStage(
        name="Privilege Escalation",
        order=4,
        description=(
            "The attacker is attempting to obtain "
            "higher privileges."
        ),
    ),

    "execution": AttackStage(
        name="Execution",
        order=5,
        description=(
            "The attacker is executing commands or "
            "scripts within the environment."
        ),
    ),

    "command_execution": AttackStage(
        name="Execution",
        order=5,
        description=(
            "The attacker is executing commands within "
            "the honeypot environment."
        ),
    ),

    "unknown_activity": AttackStage(
        name="Unknown",
        order=0,
        description=(
            "The activity could not be mapped to a "
            "known attack stage."
        ),
    ),
}


def get_attack_stage(
    behavior_category: str | None,
) -> AttackStage:

    if not behavior_category:
        return STAGES["unknown_activity"]

    return STAGES.get(
        behavior_category,
        STAGES["unknown_activity"],
    )


def build_attack_progression(events: list) -> list:

    progression = []
    seen = set()

    for event in events:

        stage = get_attack_stage(
            event.behavior_category
        )

        if stage.name in seen:
            continue

        seen.add(stage.name)

        progression.append(
            {
                "stage": stage.name,
                "order": stage.order,
                "description": stage.description,
                "first_event_id": event.id,
                "timestamp": event.timestamp,
            }
        )

    progression.sort(
        key=lambda item: item["order"]
    )

    return progression