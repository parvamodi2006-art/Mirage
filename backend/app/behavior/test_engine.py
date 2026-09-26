from backend.app.behavior.engine import analyze_event


result = analyze_event(
    event_type="command_execution",
    command="whoami",
    username="admin",
)

print("Category:", result.category)
print("Risk Score:", result.risk_score)
print("Explanation:", result.explanation)