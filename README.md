# \# 🛡️ Mirage — Adaptive Defensive Honeypot

# 

# > \*\*A controlled defensive honeypot for security research, attack behavior analysis, session intelligence, and MITRE ATT\&CK mapping.\*\*

# 

# Mirage is a cybersecurity research project designed to simulate a controlled server environment and observe suspicious interaction patterns in an isolated lab.

# 

# It captures attacker-like activity, analyzes commands and behaviors, maps observed techniques to \*\*MITRE ATT\&CK\*\*, calculates session risk, tracks attack progression, and provides an interactive dashboard for security analysis.

# 

# \---

# 

# \## 🎯 What is Mirage?

# 

# Traditional honeypots primarily focus on collecting logs.

# 

# \*\*Mirage goes one step further by turning those interactions into security intelligence.\*\*

# 

# A captured command can be analyzed for:

# 

# \* Behavior category

# \* Risk score

# \* Severity

# \* MITRE ATT\&CK technique

# \* MITRE tactic

# \* Attack stage

# \* Session-level threat level

# 

# This allows analysts to understand not only \*\*what happened\*\*, but also how an observed session progressed.

# 

# \---

# 

# \## ⚡ Core Capabilities

# 

# \### 🍯 Controlled Honeypot

# 

# Mirage provides a controlled TCP-based honeypot environment that simulates a shell-like service.

# 

# It can:

# 

# \* Accept connection attempts

# \* Simulate authentication

# \* Provide a fake shell prompt

# \* Accept commands

# \* Generate telemetry

# \* Keep the interaction isolated from the real host

# 

# > \*\*Note:\*\* The current SSH component is a controlled plain TCP honeypot and does not implement the real SSH protocol.

# 

# \---

# 

# \### 🧠 Behavioral Analysis

# 

# Commands are analyzed by the Mirage behavior engine and classified into security-relevant categories.

# 

# Current behavior categories include:

# 

# | Behavior                | Example           | Risk |

# | ----------------------- | ----------------- | ---: |

# | Authentication Activity | Login attempt     |   30 |

# | System Discovery        | `whoami`          |   60 |

# | Network Discovery       | `ifconfig`        |   60 |

# | File Discovery          | `ls`              |   50 |

# | Credential Access       | `cat /etc/passwd` |   80 |

# | Privilege Escalation    | `sudo -l`         |   80 |

# | Execution               | `bash`            |   60 |

# | Command Execution       | Unknown commands  |   40 |

# 

# Risk values are part of the current project detection model and are not intended to represent a universal threat score.

# 

# \---

# 

# \## 🎯 MITRE ATT\&CK Mapping

# 

# Mirage maps detected behavior to relevant MITRE ATT\&CK techniques.

# 

# | Behavior             | Technique                                    | Tactic               |

# | -------------------- | -------------------------------------------- | -------------------- |

# | System Discovery     | T1033 — System Owner/User Discovery          | Discovery            |

# | Network Discovery    | T1049 — System Network Connections Discovery | Discovery            |

# | File Discovery       | T1083 — File and Directory Discovery         | Discovery            |

# | Credential Access    | T1552 — Unsecured Credentials                | Credential Access    |

# | Privilege Escalation | T1548 — Abuse Elevation Control Mechanism    | Privilege Escalation |

# | Command Execution    | T1059 — Command and Scripting Interpreter    | Execution            |

# 

# This mapping helps transform raw honeypot telemetry into an ATT\&CK-oriented attack narrative.

# 

# \---

# 

# \## 📊 Session Risk Intelligence

# 

# Mirage calculates a session-level risk score using multiple signals including:

# 

# \* Highest observed event risk

# \* Average event risk

# \* Behavioral diversity

# \* High-risk activity

# \* Critical activity

# 

# The session is then assigned a threat level:

# 

# ```text

# LOW

# MEDIUM

# HIGH

# CRITICAL

# ```

# 

# Example:

# 

# ```text

# Session Risk: 96

# Threat Level: CRITICAL

# ```

# 

# \---

# 

# \## 🧭 Attack Progression

# 

# Mirage tracks the progression of observed activity across security stages.

# 

# Example attack progression:

# 

# ```text

# Initial Access

# &#x20;     ↓

# Discovery

# &#x20;     ↓

# Credential Access

# &#x20;     ↓

# Privilege Escalation

# &#x20;     ↓

# Execution

# ```

# 

# This provides a higher-level view of how activity evolved during a session.

# 

# \---

# 

# \## ⏱️ Attack Replay

# 

# Every tracked session can be reconstructed as a chronological timeline.

# 

# Replay data includes:

# 

# \* Event sequence

# \* Timestamp

# \* Relative time

# \* Username

# \* Command

# \* Behavior category

# \* Risk score

# \* Severity

# \* MITRE technique

# \* MITRE tactic

# \* Event description

# 

# This makes it possible to reconstruct an observed interaction without manually reading raw logs.

# 

# \---

# 

# \## 🖥️ Security Dashboard

# 

# Mirage includes a React-based security dashboard for investigating telemetry.

# 

# \### Dashboard sections

# 

# \* \*\*Overview\*\*

# \* \*\*Attack Sessions\*\*

# \* \*\*Session Intelligence\*\*

# \* \*\*Live Telemetry\*\*

# \* \*\*MITRE ATT\&CK\*\*

# \* \*\*Attack Replay\*\*

# \* \*\*Honeypots\*\*

# \* \*\*Event Store\*\*

# 

# The dashboard communicates with the FastAPI backend and periodically refreshes session and event telemetry.

# 

# \---

# 

# \## 🏗️ Architecture

# 

# ```text

# &#x20;                   ┌──────────────────────┐

# &#x20;                   │   Honeypot Client    │

# &#x20;                   │   / Lab Interaction  │

# &#x20;                   └──────────┬───────────┘

# &#x20;                              │

# &#x20;                              ▼

# &#x20;                   ┌──────────────────────┐

# &#x20;                   │   Mirage Honeypot    │

# &#x20;                   │    TCP Listener      │

# &#x20;                   │      :2222           │

# &#x20;                   └──────────┬───────────┘

# &#x20;                              │

# &#x20;                              ▼

# &#x20;                   ┌──────────────────────┐

# &#x20;                   │      Telemetry       │

# &#x20;                   │       Engine         │

# &#x20;                   └──────────┬───────────┘

# &#x20;                              │

# &#x20;             ┌────────────────┼────────────────┐

# &#x20;             ▼                ▼                ▼

# &#x20;      ┌────────────┐   ┌─────────────┐   ┌──────────────┐

# &#x20;      │  Behavior  │   │    MITRE    │   │     Risk     │

# &#x20;      │  Analysis  │   │   Mapping   │   │    Engine    │

# &#x20;      └─────┬──────┘   └──────┬──────┘   └──────┬───────┘

# &#x20;            │                 │                 │

# &#x20;            └─────────────────┼─────────────────┘

# &#x20;                              ▼

# &#x20;                   ┌──────────────────────┐

# &#x20;                   │   Session Intelligence│

# &#x20;                   │  Attack Progression  │

# &#x20;                   │    \& Atta

# ```



