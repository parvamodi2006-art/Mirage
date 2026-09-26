from dataclasses import dataclass
import re


@dataclass
class BehaviorResult:
    category: str
    risk_score: int
    severity: str
    explanation: str


def calculate_severity(risk_score: int) -> str:
    if risk_score >= 80:
        return "critical"

    if risk_score >= 60:
        return "high"

    if risk_score >= 30:
        return "medium"

    return "low"


def command_matches(command: str, patterns: list[str]) -> bool:
    command = command.strip().lower()

    for pattern in patterns:
        if re.search(pattern, command):
            return True

    return False


def analyze_event(
    event_type: str,
    command: str | None = None,
    username: str | None = None,
) -> BehaviorResult:

    event_type = event_type.lower()

    # ---------------------------------
    # Authentication Activity
    # ---------------------------------

    if event_type == "login_attempt":
        risk_score = 30

        return BehaviorResult(
            category="authentication_activity",
            risk_score=risk_score,
            severity=calculate_severity(risk_score),
            explanation="An authentication attempt was detected.",
        )

    # ---------------------------------
    # Command Analysis
    # ---------------------------------

    if event_type == "command_execution":

        if not command:
            return BehaviorResult(
                category="command_execution",
                risk_score=40,
                severity="medium",
                explanation="A command was executed without command content.",
            )

        command_lower = command.strip().lower()

        # System / Account Discovery
        if command_matches(
            command_lower,
            [
                r"^whoami$",
                r"^id$",
                r"^uname(\s|$)",
                r"^hostname$",
                r"^w$",
                r"^who$",
            ],
        ):
            risk_score = 60

            return BehaviorResult(
                category="system_discovery",
                risk_score=risk_score,
                severity=calculate_severity(risk_score),
                explanation=(
                    "The command indicates possible system or "
                    "account discovery activity."
                ),
            )

        # Network Discovery
        if command_matches(
            command_lower,
            [
                r"^ifconfig(\s|$)",
                r"^ip\s+addr",
                r"^ip\s+route",
                r"^netstat(\s|$)",
                r"^ss(\s|$)",
                r"^arp(\s|$)",
            ],
        ):
            risk_score = 60

            return BehaviorResult(
                category="network_discovery",
                risk_score=risk_score,
                severity=calculate_severity(risk_score),
                explanation=(
                    "The command indicates possible network "
                    "discovery activity."
                ),
            )

        # File and Directory Discovery
        if command_matches(
            command_lower,
            [
                r"^ls(\s|$)",
                r"^find(\s|$)",
                r"^pwd$",
                r"^tree(\s|$)",
                r"^dir(\s|$)",
            ],
        ):
            risk_score = 50

            return BehaviorResult(
                category="file_discovery",
                risk_score=risk_score,
                severity=calculate_severity(risk_score),
                explanation=(
                    "The command indicates possible file and "
                    "directory discovery activity."
                ),
            )

        # Credential Access
        if command_matches(
            command_lower,
            [
                r"/etc/passwd",
                r"/etc/shadow",
                r"cat\s+.*passwd",
                r"cat\s+.*shadow",
                r"grep\s+.*password",
                r"history",
            ],
        ):
            risk_score = 80

            return BehaviorResult(
                category="credential_access",
                risk_score=risk_score,
                severity=calculate_severity(risk_score),
                explanation=(
                    "The command indicates possible credential "
                    "access or credential discovery activity."
                ),
            )

        # Privilege Escalation
        if command_matches(
            command_lower,
            [
                r"^sudo(\s|$)",
                r"^su(\s|$)",
                r"^pkexec(\s|$)",
            ],
        ):
            risk_score = 80

            return BehaviorResult(
                category="privilege_escalation",
                risk_score=risk_score,
                severity=calculate_severity(risk_score),
                explanation=(
                    "The command indicates possible privilege "
                    "escalation activity."
                ),
            )

        # Command / Script Execution
        if command_matches(
            command_lower,
            [
                r"^bash(\s|$)",
                r"^sh(\s|$)",
                r"^python(\s|$)",
                r"^python3(\s|$)",
                r"^perl(\s|$)",
                r"^ruby(\s|$)",
            ],
        ):
            risk_score = 60

            return BehaviorResult(
                category="execution",
                risk_score=risk_score,
                severity=calculate_severity(risk_score),
                explanation=(
                    "The command indicates execution through a "
                    "command or scripting interpreter."
                ),
            )

        # Generic command
        risk_score = 40

        return BehaviorResult(
            category="command_execution",
            risk_score=risk_score,
            severity=calculate_severity(risk_score),
            explanation="A command was executed in the honeypot session.",
        )

    # ---------------------------------
    # Unknown Event
    # ---------------------------------

    risk_score = 20

    return BehaviorResult(
        category="unknown_activity",
        risk_score=risk_score,
        severity=calculate_severity(risk_score),
        explanation="The event type is not currently classified.",
    )