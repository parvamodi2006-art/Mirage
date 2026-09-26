import requests


BASE_URL = "http://127.0.0.1:8000"

SOURCE_IP = "192.168.1.101"


def check(condition, message):

    if condition:
        print(f"[PASS] {message}")

    else:
        print(f"[FAIL] {message}")
        raise AssertionError(message)


print()
print("=" * 70)
print(" MIRAGE PROFESSIONAL ATTACK INTELLIGENCE TEST")
print("=" * 70)


# HEALTH

response = requests.get(
    f"{BASE_URL}/health"
)

check(
    response.status_code == 200,
    "Health endpoint",
)


# CREATE SESSION

response = requests.post(
    f"{BASE_URL}/api/telemetry/session",
    params={
        "source_ip": SOURCE_IP,
        "service": "ssh",
    },
)

check(
    response.status_code == 200,
    "Attack session creation",
)

session_id = response.json()["session_id"]

print(
    f"       Session: {session_id}"
)


# ATTACK SEQUENCE

commands = [
    "whoami",
    "ifconfig",
    "ls -la",
    "cat /etc/passwd",
    "sudo -l",
    "bash",
]


for command in commands:

    response = requests.post(

        f"{BASE_URL}/api/telemetry/event",

        params={
            "session_id": session_id,
        },

        json={
            "source_ip": SOURCE_IP,
            "service": "ssh",
            "event_type": "command_execution",
            "username": "root",
            "command": command,
        },
    )

    check(
        response.status_code == 200,
        f"Telemetry event: {command}",
    )


# SESSION LIST

response = requests.get(
    f"{BASE_URL}/api/telemetry/sessions"
)

check(
    response.status_code == 200,
    "Session intelligence endpoint",
)

sessions = response.json()["sessions"]

current_session = next(
    item
    for item in sessions
    if item["session_id"] == session_id
)

check(
    current_session["event_count"] == 6,
    "Session event count",
)

print(
    "       Session Risk:",
    current_session["risk"],
)


# SESSION INTELLIGENCE

response = requests.get(
    f"{BASE_URL}/api/telemetry/sessions/{session_id}"
)

check(
    response.status_code == 200,
    "Session intelligence details",
)

details = response.json()

risk = details["intelligence"]["risk"]

check(
    risk["score"] >= 65,
    "Session risk calculation",
)

check(
    risk["threat_level"]
    in ["high", "critical"],
    "Threat level classification",
)

progression = details[
    "intelligence"
]["attack_progression"]

check(
    len(progression) >= 4,
    "Attack progression detection",
)

print()
print("Attack Progression:")

for stage in progression:

    print(
        f"  {stage['order']}. "
        f"{stage['stage']}"
    )


# ATTACK REPLAY

response = requests.get(

    f"{BASE_URL}/api/telemetry/"
    f"sessions/{session_id}/replay"
)

check(
    response.status_code == 200,
    "Attack replay endpoint",
)

replay = response.json()["replay"]

check(
    replay["event_count"] == 6,
    "Replay event count",
)

check(
    len(replay["timeline"]) == 6,
    "Replay timeline",
)

sequences = [
    item["sequence"]
    for item in replay["timeline"]
]

check(
    sequences == [1, 2, 3, 4, 5, 6],
    "Replay sequence ordering",
)


print()
print("=" * 70)
print(" PROFESSIONAL ATTACK INTELLIGENCE")
print("=" * 70)

print(
    "Session Risk      :",
    risk["score"],
)

print(
    "Threat Level      :",
    risk["threat_level"],
)

print(
    "Severity          :",
    risk["severity"],
)

print(
    "Attack Stages     :",
    len(progression),
)

print(
    "Replay Events     :",
    replay["event_count"],
)

print()
print("=" * 70)
print(" STATUS: ALL PROFESSIONAL FEATURES PASSED")
print("=" * 70)
print()