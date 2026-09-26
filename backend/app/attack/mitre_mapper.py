from dataclasses import dataclass


@dataclass
class MitreTechnique:
    technique_id: str
    technique_name: str
    tactic: str
    description: str


TECHNIQUES = {

    # -----------------------------
    # Discovery
    # -----------------------------

    "system_discovery": MitreTechnique(
        technique_id="T1033",
        technique_name="System Owner/User Discovery",
        tactic="Discovery",
        description=(
            "Adversaries may attempt to identify the primary "
            "user or users associated with a system."
        ),
    ),

    "network_discovery": MitreTechnique(
        technique_id="T1049",
        technique_name="System Network Connections Discovery",
        tactic="Discovery",
        description=(
            "Adversaries may attempt to identify network "
            "connections to or from a compromised system."
        ),
    ),

    "file_discovery": MitreTechnique(
        technique_id="T1083",
        technique_name="File and Directory Discovery",
        tactic="Discovery",
        description=(
            "Adversaries may enumerate files and directories "
            "to understand the contents of a system."
        ),
    ),

    # -----------------------------
    # Credential Access
    # -----------------------------

    "credential_access": MitreTechnique(
        technique_id="T1552",
        technique_name="Unsecured Credentials",
        tactic="Credential Access",
        description=(
            "Adversaries may search for credentials stored "
            "in insecure locations."
        ),
    ),

    # -----------------------------
    # Privilege Escalation
    # -----------------------------

    "privilege_escalation": MitreTechnique(
        technique_id="T1548",
        technique_name="Abuse Elevation Control Mechanism",
        tactic="Privilege Escalation",
        description=(
            "Adversaries may abuse mechanisms that control "
            "elevated privileges."
        ),
    ),

    # -----------------------------
    # Execution
    # -----------------------------

    "execution": MitreTechnique(
        technique_id="T1059",
        technique_name="Command and Scripting Interpreter",
        tactic="Execution",
        description=(
            "Adversaries may abuse command interpreters "
            "to execute commands."
        ),
    ),

    # -----------------------------
    # Generic Command Execution
    # -----------------------------

    "command_execution": MitreTechnique(
        technique_id="T1059",
        technique_name="Command and Scripting Interpreter",
        tactic="Execution",
        description=(
            "Adversaries may abuse command interpreters "
            "to execute commands."
        ),
    ),
}


def map_behavior_to_mitre(category: str) -> MitreTechnique | None:
    """
    Map a behavior category to a MITRE ATT&CK technique.
    """

    return TECHNIQUES.get(category)