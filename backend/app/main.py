```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.telemetry.database import (
    engine,
    Base,
)

from backend.app.telemetry.db_models import Event
from backend.app.telemetry.session_models import AttackSession

from backend.app.telemetry.routes import (
    router as telemetry_router,
)


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="Mirage",
    description=(
        "Adaptive Defensive Honeypot "
        "with Behavior Analysis and "
        "MITRE ATT&CK Mapping"
    ),
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    telemetry_router
)


@app.get("/")
def root():
    return {
        "name": "Mirage",
        "version": "0.1.0",
        "status": "online",
        "components": [
            "Telemetry",
            "Behavior Engine",
            "MITRE ATT&CK Mapper",
            "Attack Session Tracking",
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "mirage-api",
        "version": "0.1.0",
    }
```
