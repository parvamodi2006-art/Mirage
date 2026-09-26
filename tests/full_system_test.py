import requests
import json


BASE_URL = "http://127.0.0.1:8000"


def print_result(title, data):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)
    print(json.dumps(data, indent=2, default=str))


# ============================================================
# 1. HEALTH CHECK
# ============================================================

response = requests.get(
    f"{BASE_URL}/health"
)

response.raise_for_status()

print_result(
    "HEALTH CHECK",
    response.json()
)


# ============================================================
# 2. CREATE ATTACK SESSION
# ============================================================

session_response = requests.post(
    f"{BASE_URL}/api/telemetry/session",
    params={
        "source_ip": "192.168.1.101",
        "service": "ssh",
    },
)

session_response.raise_for_status()

session_data = session_response.json()

print_result(
    "ATTACK SESSION CREATED",
    session_data
)

session_id = session_data["session_id"]


# ============================================================
# 3. TEST MULTIPLE BEHAVIORS
# ============================================================

test_events = [

    {
        "name": "System Discovery",
        "command": "whoami",
        "expected_category": "system_discovery",
        "expected_mitre": "T1033",
    },

    {
        "name": "Network Discovery",
        "command": "ifconfig",
        "expected_category": "network_discovery",
        "expected_mitre": "T1049",
    },

    {
        "name": "File Discovery",
        "command": "ls -la",
        "expected_category": "file_discovery",
        "expected_mitre": "T1083",
    },

    {
        "name": "Credential Access",
        "command": "cat /etc/passwd",
        "expected_category": "credential_access",
        "expected_mitre": "T1552",
    },

    {
        "name": "Privilege Escalation",
        "command": "sudo -l",
        "expected_category": "privilege_escalation",
        "expected_mitre": "T1548",
    },

    {
        "name": "Command Execution",
        "command": "bash",
        "expected_category": "execution",
        "expected_mitre": "T1059",
    },

]


results = []


for test in test_events:

    payload = {

        "source_ip": "192.168.1.101",

        "service": "ssh",

        "event_type": "command_execution",

        "username": "admin",

        "command": test["command"],

        "description": (
            f"Automated test: {test['name']}"
        ),

    }

    response = requests.post(

        f"{BASE_URL}/api/telemetry/event",

        params={
            "session_id": session_id
        },

        json=payload,
    )

    response.raise_for_status()

    data = response.json()

    behavior = data["behavior"]

    mitre = data["mitre_attack"]

    passed = (

        behavior["category"]
        == test["expected_category"]

        and

        mitre["technique_id"]
        == test["expected_mitre"]
    )

    result = {

        "test": test["name"],

        "command": test["command"],

        "category": behavior["category"],

        "risk_score": behavior["risk_score"],

        "severity": behavior["severity"],

        "mitre": mitre["technique_id"],

        "status": "PASS" if passed else "FAIL",

    }

    results.append(result)

    print_result(
        test["name"],
        result
    )


# ============================================================
# 4. READ EVENTS FROM DATABASE
# ============================================================

events_response = requests.get(
    f"{BASE_URL}/api/telemetry/events"
)

events_response.raise_for_status()

events_data = events_response.json()

print_result(
    "DATABASE EVENT READBACK",
    events_data
)


# ============================================================
# 5. READ SESSION TIMELINE
# ============================================================

timeline_response = requests.get(

    f"{BASE_URL}/api/telemetry/sessions/"
    f"{session_id}"

)

timeline_response.raise_for_status()

timeline_data = timeline_response.json()

print_result(
    "ATTACK SESSION TIMELINE",
    timeline_data
)


# ============================================================
# 6. FINAL SUMMARY
# ============================================================

passed_tests = sum(

    1

    for result in results

    if result["status"] == "PASS"

)

failed_tests = len(results) - passed_tests


print("\n")

print("=" * 70)

print("MIRAGE FULL SYSTEM TEST")

print("=" * 70)

print(
    f"Behavior Tests : {passed_tests}/{len(results)} passed"
)

print(
    f"Failed Tests   : {failed_tests}"
)

print(
    f"Database Events: {events_data['count']}"
)

print(
    f"Timeline Events: {timeline_data['event_count']}"
)

print("=" * 70)


if failed_tests == 0:

    print(
        "STATUS: ALL TESTS PASSED"
    )

else:

    print(
        "STATUS: SOME TESTS FAILED"
    )