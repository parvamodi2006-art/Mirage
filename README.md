# 🛡️ Mirage — Adaptive Defensive Honeypot


## 📸 Dashboard Prev# 🛡️ Mirage — Adaptive Defensive Honeypot


![Python](https://img.shields.io/badge/Python-3.x-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-API-green)
![React](https://img.shields.io/badge/React-Dashboard-61DAFB)
![MITRE ATT&CK](https://img.shields.io/badge/MITRE%20ATT%26CK-Mapped-red)
![License](https://img.shields.io/badge/License-MIT-yellow)


\

**A controlled defensive honeypot for security research, attack behavior analysis, session intelligence, and MITRE ATT&CK mapping.**

Mirage is a cybersecurity research project that simulates a controlled server environment and captures attacker-like interactions for analysis.

It records sessions and commands, classifies observed behavior, maps activity to MITRE ATT&CK techniques, calculates session-level risk, tracks attack progression, reconstructs attack timelines, and presents the resulting security intelligence through a React dashboard.

> **Current scope:** Mirage is a controlled research/lab honeypot. Its current SSH-like service is a plain TCP line-based simulation and does not implement the real SSH protocol.

---

## 🌐 Live Demo

### Dashboard

**https://mirage-teal.vercel.app/**

### Backend API

**https://mirage-eapi.onrender.com/**

### API Documentation

**https://mirage-eapi.onrender.com/docs**

The live demonstration uses a deployed FastAPI backend, PostgreSQL database, and React dashboard.

---

## 📸 Dashboard Preview

### Overview

![Mirage Overview](screenshots/overview.png)

### Session Intelligence

![Mirage Session Intelligence](screenshots/session-intelligence.png)

### Live Telemetry

![Mirage Live Telemetry](screenshots/live-telemetry.png)

### Attack Replay

![Mirage Attack Replay](screenshots/attack-replay.png)

---

## ✨ Features

* 🍯 Controlled TCP-based honeypot
* 📡 Session and event telemetry
* 🧠 Behavioral command analysis
* 🎯 MITRE ATT&CK technique mapping
* 📊 Session-level risk scoring
* 🚨 Severity classification
* 🧭 Attack progression tracking
* ⏱️ Attack session replay
* 🔎 Session intelligence
* 🖥️ React security dashboard
* 💾 Persistent event and session storage
* 🗄️ PostgreSQL production database
* 🧪 SQLite local development fallback
* 🚀 Render backend deployment
* ⚡ Vercel frontend deployment

---

## 🧠 Behavior Analysis

Mirage analyzes observed commands and categorizes them into security-relevant behaviors.

| Behavior                | Example           | Risk |
| ----------------------- | ----------------- | ---: |
| Authentication Activity | Login attempt     |   30 |
| System Discovery        | `whoami`          |   60 |
| Network Discovery       | `ifconfig`        |   60 |
| File Discovery          | `ls`              |   50 |
| Credential Access       | `cat /etc/passwd` |   80 |
| Privilege Escalation    | `sudo -l`         |   80 |
| Execution               | `bash`            |   60 |
| Command Execution       | Unknown commands  |   40 |

> Risk values are part of Mirage's current detection model. They are project-specific detection scores and do not represent a universal threat score.

---

## 🎯 MITRE ATT&CK Mapping

Mirage maps detected behaviors to relevant MITRE ATT&CK techniques.

| Behavior             | Technique                                    | Tactic               |
| -------------------- | -------------------------------------------- | -------------------- |
| System Discovery     | T1033 — System Owner/User Discovery          | Discovery            |
| Network Discovery    | T1049 — System Network Connections Discovery | Discovery            |
| File Discovery       | T1083 — File and Directory Discovery         | Discovery            |
| Credential Access    | T1552 — Unsecured Credentials                | Credential Access    |
| Privilege Escalation | T1548 — Abuse Elevation Control Mechanism    | Privilege Escalation |
| Execution            | T1059 — Command and Scripting Interpreter    | Execution            |

---

## 📊 Session Intelligence

Mirage combines individual event observations into session-level security intelligence.

The risk engine considers:

* Highest observed event risk
* Average event risk
* Behavioral diversity
* High-risk activity
* Critical activity

### Example Production Demo Session

```text
Session Status     : COMPLETED
Events             : 7
Attack Stages      : 5
MITRE Techniques   : 5
Threat Level       : CRITICAL
```

The current demonstration attack progression is:

```text
Initial Access
      ↓
Discovery
      ↓
Credential Access
      ↓
Privilege Escalation
      ↓
Execution
```

---

## 🧭 Attack Progression

Mirage converts observed behavior into an ordered attack progression.

```text
Authentication Activity
          ↓
       Discovery
          ↓
   Credential Access
          ↓
  Privilege Escalation
          ↓
      Execution
```

This provides an analyst-oriented view of how activity develops during a session.

---

## ⏱️ Attack Replay

Mirage reconstructs a session into a chronological replayable timeline.

Each event can contain:

* Event sequence
* Timestamp
* Relative time
* Username
* Command
* Behavior category
* Risk score
* Severity
* MITRE technique
* MITRE tactic
* Event description

Example controlled session:

```text
Login Attempt
      ↓
whoami
      ↓
ifconfig
      ↓
cat /etc/passwd
      ↓
sudo -l
      ↓
bash
```

The dashboard converts this raw activity into structured security intelligence.

---

## 🔄 Security Telemetry Pipeline

```text
┌──────────────────────────┐
│   Honeypot Interaction   │
│       TCP :2222          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      Session Manager     │
│  Login + Command Events  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│        Telemetry         │
│    Events + Sessions     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    Behavior Analysis     │
│ Discovery / Credentials  │
│ Privilege / Execution    │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌────────────┐ ┌────────────┐
│   MITRE    │ │    Risk    │
│   Mapper   │ │   Engine   │
└─────┬──────┘ └─────┬──────┘
      │              │
      └──────┬───────┘
             ▼
┌──────────────────────────┐
│   Session Intelligence   │
│ Attack Progression +     │
│ Attack Replay            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      FastAPI Backend     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     React Dashboard      │
└──────────────────────────┘
```

---

## 🏗️ Production Architecture

```text
                    ┌─────────────────────┐
                    │       GitHub        │
                    │   Mirage Repository │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Render        │
                    │    FastAPI Backend  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Render PostgreSQL  │
                    │ Sessions + Events   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Vercel        │
                    │   React Dashboard   │
                    └─────────────────────┘
```

### Local Development Architecture

```text
┌─────────────────────┐
│   Mirage Honeypot   │
│      TCP :2222      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   FastAPI Backend   │
│      :8000          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SQLite Development  │
│    Database         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   React Dashboard   │
│      :5173          │
└─────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* Uvicorn
* SQLAlchemy
* psycopg
* AsyncIO
* Requests

### Frontend

* React
* Vite
* JavaScript
* Lucide React

### Database

* PostgreSQL — production
* SQLite — local development fallback

### Security / Detection

* Behavioral analysis
* Risk scoring
* Severity classification
* MITRE ATT&CK mapping
* Attack progression
* Session intelligence
* Attack replay

### Deployment

* GitHub
* Render
* Render PostgreSQL
* Vercel

---

## 📁 Project Structure

```text
Mirage/
│
├── backend/
│   ├── app/
│   │   ├── attack/
│   │   │   ├── attack_stage.py
│   │   │   ├── mitre_mapper.py
│   │   │   ├── replay.py
│   │   │   └── risk_engine.py
│   │   │
│   │   ├── behavior/
│   │   │   └── engine.py
│   │   │
│   │   ├── honeypot/
│   │   │   ├── ssh_server.py
│   │   │   └── telemetry_client.py
│   │   │
│   │   ├── telemetry/
│   │   │   ├── database.py
│   │   │   ├── db_models.py
│   │   │   ├── routes.py
│   │   │   └── session_models.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── seed_demo.py
│
├── dashboard/
│   ├── src/
│   │   ├── App.jsx
│   │   └── api.js
│   ├── package.json
│   └── ...
│
├── screenshots/
│   ├── overview.png
│   ├── session-intelligence.png
│   ├── live-telemetry.png
│   └── attack-replay.png
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/parvamodi2006-art/Mirage.git
cd Mirage
```

---

### 2. Backend Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```cmd
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Dashboard Setup

Open another terminal:

```cmd
cd dashboard
npm install
npm run dev
```

Dashboard:

```text
http://localhost:5173
```

---

### 4. Start the Honeypot

From the project root:

```cmd
python -m backend.app.honeypot.ssh_server
```

The current controlled honeypot listens on:

```text
127.0.0.1:2222
```

---

## 🍯 Honeypot

The current Mirage honeypot provides a controlled TCP-based server simulation.

It can capture:

* Connection attempts
* Authentication attempts
* Usernames
* Commands
* Session lifecycle
* Source IP
* Service information

The current implementation is **not a real SSH server**.

It uses a plain TCP line-based interaction model designed for controlled security research and telemetry generation.

---

## 📡 API

### Health

```http
GET /
GET /health
```

### Sessions

```http
POST /api/telemetry/session

GET /api/telemetry/sessions

GET /api/telemetry/sessions/{session_id}

POST /api/telemetry/session/{session_id}/close

GET /api/telemetry/sessions/{session_id}/replay
```

### Events

```http
POST /api/telemetry/event

GET /api/telemetry/events
```

Interactive API documentation is available through FastAPI Swagger:

```text
http://127.0.0.1:8000/docs
```

For the deployed API:

```text
https://mirage-eapi.onrender.com/docs
```

---

## 🗄️ Database Configuration

Mirage supports different database backends depending on the environment.

### Local Development

If `DATABASE_URL` is not configured, Mirage falls back to SQLite:

```text
backend/data/mirage.db
```

### Production

The deployed backend uses PostgreSQL through the `DATABASE_URL` environment variable.

This allows the same application code to operate with:

```text
Local       → SQLite
Production  → PostgreSQL
```

---

## 🔐 Security Considerations

Mirage is intended for authorized security research, education, and controlled laboratory environments.

When experimenting with the project:

* Use an isolated VM, container, or dedicated lab environment.
* Never expose real credentials.
* Never connect simulated services to production systems.
* Do not provide access to the real host filesystem.
* Do not store real secrets inside the honeypot.
* Monitor only systems and traffic you are authorized to test.
* Keep the honeypot isolated from sensitive infrastructure.

The current implementation should be treated as a **research/lab honeypot**, not as a production-grade internet-facing deception platform.

---

## 🗺️ Roadmap

### Completed

* [x] Honeypot listener
* [x] Session tracking
* [x] Event telemetry
* [x] Behavioral analysis
* [x] Risk scoring
* [x] Severity classification
* [x] MITRE ATT&CK mapping
* [x] Attack progression
* [x] Attack replay
* [x] React security dashboard
* [x] PostgreSQL production support
* [x] Render backend deployment
* [x] Vercel dashboard deployment
* [x] Production telemetry demonstration

### Planned

* [ ] Adaptive deception
* [ ] HTTP honeypot
* [ ] Multi-session correlation
* [ ] Fake credentials and files
* [ ] Threat intelligence enrichment
* [ ] Automated security reports
* [ ] Attacker fingerprinting
* [ ] Containerized deployment
* [ ] Additional protocol simulations
* [ ] Advanced deception profiles

---

## 👨‍💻 Author

**Parva Modi**

Cybersecurity Student / Trainee

Focus areas:

* Penetration Testing
* VAPT
* SOC Operations
* Threat Detection
* Security Engineering

### Links

* GitHub: https://github.com/parvamodi2006-art
* LinkedIn: https://www.linkedin.com/in/parva-modi-314389358/

---

## ⚠️ Disclaimer

Mirage is intended for authorized security research, cybersecurity education, and controlled laboratory environments only.

Do not deploy or use the project against systems, networks, services, or infrastructure without proper authorization.

The project is provided for defensive research and educational purposes.

---

## ⭐ Support

If you find Mirage useful for learning, research, or security experimentation, consider giving the repository a ⭐.

**Repository:**
https://github.com/parvamodi2006-art/Mirage

**Live Dashboard:**
https://mirage-teal.vercel.app/
iew

### Overview

![Mirage Overview](screenshots/overview.png)

### Session Intelligence

![Mirage Session Intelligence](screenshots/session-intelligence.png)

### Live Telemetry

![Mirage Live Telemetry](screenshots/live-telemetry.png)

### Attack Replay

![Mirage Attack Replay](screenshots/attack-replay.png)

## ✨ Features

* 🍯 Controlled TCP-based honeypot
* 🧠 Behavioral command analysis
* 🎯 MITRE ATT&CK technique mapping
* 📊 Session risk scoring
* 🚨 Severity classification
* 🧭 Attack progression tracking
* ⏱️ Attack session replay
* 📡 Real-time telemetry
* 🖥️ React security dashboard
* 💾 Persistent event and session storage

---

## 🧠 Behavior Analysis

Mirage analyzes observed commands and categorizes them into security-relevant behaviors.

| Behavior                | Example           | Risk |
| ----------------------- | ----------------- | ---: |
| Authentication Activity | Login attempt     |   30 |
| System Discovery        | `whoami`          |   60 |
| Network Discovery       | `ifconfig`        |   60 |
| File Discovery          | `ls`              |   50 |
| Credential Access       | `cat /etc/passwd` |   80 |
| Privilege Escalation    | `sudo -l`         |   80 |
| Execution               | `bash`            |   60 |
| Command Execution       | Unknown commands  |   40 |

Risk values are part of the current Mirage detection model and are not intended to represent a universal threat score.

---

## 🎯 MITRE ATT&CK Mapping

Mirage maps detected behaviors to relevant MITRE ATT&CK techniques.

| Behavior             | Technique | Tactic               |
| -------------------- | --------- | -------------------- |
| System Discovery     | T1033     | Discovery            |
| Network Discovery    | T1049     | Discovery            |
| File Discovery       | T1083     | Discovery            |
| Credential Access    | T1552     | Credential Access    |
| Privilege Escalation | T1548     | Privilege Escalation |
| Command Execution    | T1059     | Execution            |

---

## 📊 Session Intelligence

Mirage calculates a session-level risk score using:

* Highest observed event risk
* Average event risk
* Behavioral diversity
* High-risk activity
* Critical activity

Example:

```text
Session Risk    : 96
Threat Level    : CRITICAL
Events          : 6
Attack Stages   : 5
MITRE Techniques: 5
```

---

## 🧭 Attack Progression

Observed activity can be represented as a progression:

```text
Initial Access
      ↓
Discovery
      ↓
Credential Access
      ↓
Privilege Escalation
      ↓
Execution
```

This provides an analyst-friendly view of how activity developed during a session.

---

## ⏱️ Attack Replay

Mirage can reconstruct a session as a chronological timeline containing:

* Event sequence
* Timestamp
* Relative time
* Username
* Command
* Behavior category
* Risk score
* Severity
* MITRE technique
* MITRE tactic
* Event description

---

## 🖥️ Security Dashboard

The React dashboard provides dedicated views for:

* Overview
* Attack Sessions
* Session Intelligence
* Live Telemetry
* MITRE ATT&CK
* Attack Replay
* Honeypots
* Event Store

---

## ⚡ Quick Demo / How It Works

Mirage follows a simple security telemetry pipeline:

```text
┌──────────────────────┐
│  Honeypot Listener   │
│      TCP :2222       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Attacker Interaction │
│ Login + Commands     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Telemetry       │
│ Events + Sessions    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Behavior Analysis   │
│ Discovery / Creds /  │
│ Privilege / Execution│
└──────────┬───────────┘
           │
           ├─────────────────┐
           ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ MITRE ATT&CK     │  │   Risk Engine    │
│ Technique Mapping│  │ Score + Severity │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌──────────────────────┐
         │ Session Intelligence │
         │ Attack Progression   │
         │ + Attack Replay      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   React Dashboard    │
         │ Live Security View   │
         └──────────────────────┘
```

### Example Attack Flow

A controlled test session can produce activity such as:

```text
Login Attempt
     ↓
whoami
     ↓
ifconfig
     ↓
cat /etc/passwd
     ↓
sudo -l
     ↓
bash
```

Mirage analyzes each event and converts the observed activity into security intelligence:

```text
Command
   ↓
Behavior Category
   ↓
Risk Score + Severity
   ↓
MITRE ATT&CK Technique
   ↓
Attack Stage
   ↓
Session Risk
   ↓
Replayable Timeline
```

### Example Session Result

```text
Session Risk     : 96
Threat Level     : CRITICAL
Events           : 6
Attack Stages    : 5
MITRE Techniques : 5

Initial Access
      ↓
Discovery
      ↓
Credential Access
      ↓
Privilege Escalation
      ↓
Execution
```

This allows analysts to move from **raw honeypot activity → structured security intelligence** through a single workflow.


## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │   Lab Interaction  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Mirage Honeypot   │
                    │    TCP :2222       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Telemetry      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌───────────┐    ┌───────────┐    ┌───────────┐
        │ Behavior  │    │   MITRE   │    │    Risk   │
        │  Engine   │    │  Mapper   │    │   Engine  │
        └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Session Intelligence│
                    │  & Attack Replay    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI API      │
                    │       :8000         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Dashboard   │
                    │       :5173         │
                    └─────────────────────┘
```

---

## 🛠️ Tech Stack

**Backend**

* Python
* FastAPI
* Uvicorn
* SQLAlchemy
* SQLite
* AsyncIO

**Frontend**

* React
* Vite
* JavaScript
* Lucide React

**Security**

* Behavioral analysis
* Risk scoring
* MITRE ATT&CK mapping
* Attack progression
* Session intelligence
* Attack replay

---

## 📁 Project Structure

```text
Mirage/
├── backend/
│   └── app/
│       ├── attack/
│       ├── behavior/
│       ├── honeypot/
│       ├── telemetry/
│       └── main.py
│
├── dashboard/
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       └── ...
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Clone

```bash
git clone https://github.com/parvamodi2006-art/Mirage.git
cd Mirage
```

### Backend

```cmd
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

Backend:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### Dashboard

Open another terminal:

```cmd
cd dashboard
npm install
npm run dev
```

Dashboard:

`http://localhost:5173`

---

## 🍯 Honeypot

The current Mirage honeypot listens on:

```text
127.0.0.1:2222
```

The current implementation is a controlled plain TCP line-based honeypot and does not implement the real SSH protocol.

---

## 📡 API

### Health

```text
GET /
GET /health
```

### Sessions

```text
POST /api/telemetry/session
GET  /api/telemetry/sessions
GET  /api/telemetry/sessions/{session_id}
GET  /api/telemetry/sessions/{session_id}/replay
```

### Events

```text
POST /api/telemetry/event
GET  /api/telemetry/events
```

---

## 🔐 Security Considerations

Mirage is intended for controlled security research and authorized laboratory environments.

When experimenting with a honeypot:

* Use an isolated VM or container.
* Never expose real credentials.
* Never connect simulated services to production systems.
* Do not provide access to the real host filesystem.
* Monitor only systems and traffic you are authorized to test.

The current implementation should be treated as a research/lab honeypot rather than a production internet-facing deception platform.

---

## 🗺️ Roadmap

### Completed

* [x] Honeypot listener
* [x] Session tracking
* [x] Event telemetry
* [x] Behavioral analysis
* [x] Risk scoring
* [x] MITRE ATT&CK mapping
* [x] Attack progression
* [x] Attack replay
* [x] React dashboard

### Planned

* [ ] Adaptive deception
* [ ] HTTP honeypot
* [ ] Multi-session correlation
* [ ] Fake credentials and files
* [ ] Threat intelligence enrichment
* [ ] Automated security reports
* [ ] Attacker fingerprinting
* [ ] Containerized deployment
* [ ] Public demonstration environment

---

## 👨‍💻 Author

**Parva Modi**

Cybersecurity Student / Trainee

Focus areas:

* Penetration Testing
* VAPT
* SOC Operations
* Threat Detection
* Security Engineering

---

## ⚠️ Disclaimer

Mirage is intended for authorized security research, education, and controlled laboratory environments only.

Do not deploy or use the project against systems or networks without proper authorization.

---

⭐ If you find Mirage useful, consider giving the repository a star.

