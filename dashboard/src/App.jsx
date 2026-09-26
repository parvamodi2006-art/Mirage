import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Crosshair,
  Database,
  Eye,
  FileSearch,
  Filter,
  Layers3,
  LockKeyhole,
  Network,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Target,
  Terminal,
  X,
  Zap,
} from "lucide-react";

import {
  getSessions,
  getEvents,
  getSessionDetails,
  getSessionReplay,
} from "./api";


// ============================================================
// Helpers
// ============================================================

function normalizeArray(value, key = null) {
  if (Array.isArray(value)) return value;

  if (
    key &&
    value &&
    Array.isArray(value[key])
  ) {
    return value[key];
  }

  return [];
}


function getMitre(event) {
  if (!event) return null;

  if (event.mitre_attack) {
    return event.mitre_attack;
  }

  if (event.mitre) {
    return event.mitre;
  }

  if (event.mitre_technique_id) {
    return {
      technique_id: event.mitre_technique_id,
      technique_name: event.mitre_technique_name,
      tactic: event.mitre_tactic,
    };
  }

  return null;
}


function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}


function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString();
}


function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) {
    return "0s";
  }

  const total = Math.max(0, Math.floor(Number(seconds)));

  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}


function getRiskValue(item) {
  return Number(
    item?.risk_score ??
    item?.risk?.score ??
    item?.risk ??
    0
  );
}


function getSeverity(item) {
  const value =
    item?.severity ??
    item?.risk?.severity ??
    "low";

  return String(value).toLowerCase();
}


function severityStyle(severity) {
  switch (String(severity).toLowerCase()) {
    case "critical":
      return {
        badge:
          "border-red-400/20 bg-red-400/10 text-red-300",
        dot: "bg-red-400",
      };

    case "high":
      return {
        badge:
          "border-orange-400/20 bg-orange-400/10 text-orange-300",
        dot: "bg-orange-400",
      };

    case "medium":
      return {
        badge:
          "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
        dot: "bg-yellow-400",
      };

    default:
      return {
        badge:
          "border-slate-400/20 bg-slate-400/10 text-slate-300",
        dot: "bg-slate-400",
      };
  }
}


function riskStyle(score) {
  const value = Number(score || 0);

  if (value >= 85) {
    return "text-red-300";
  }

  if (value >= 65) {
    return "text-orange-300";
  }

  if (value >= 35) {
    return "text-yellow-300";
  }

  return "text-cyan-300";
}


function sessionIdOf(session) {
  return (
    session?.session_id ??
    session?.id ??
    ""
  );
}


function sessionRisk(session) {
  return Number(
    session?.risk?.score ??
    session?.risk_score ??
    session?.risk ??
    0
  );
}


function sessionSeverity(session) {
  return (
    session?.risk?.severity ??
    session?.severity ??
    "unknown"
  );
}


// ============================================================
// Shared UI
// ============================================================

function Badge({ children, severity }) {
  const style = severityStyle(severity);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${style.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />
      {children}
    </span>
  );
}


function StatCard({
  label,
  value,
  icon: Icon,
  accent = "cyan",
  subtext,
}) {
  const accentClasses = {
    cyan: "border-cyan-400/10 bg-cyan-400/[0.04] text-cyan-300",
    red: "border-red-400/10 bg-red-400/[0.04] text-red-300",
    orange:
      "border-orange-400/10 bg-orange-400/[0.04] text-orange-300",
    violet:
      "border-violet-400/10 bg-violet-400/[0.04] text-violet-300",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1219] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {value}
          </p>

          {subtext && (
            <p className="mt-1 text-xs text-slate-500">
              {subtext}
            </p>
          )}
        </div>

        <div
          className={`rounded-lg border p-2.5 ${accentClasses[accent]}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}


function EmptyState({
  icon: Icon = Database,
  title,
  description,
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0d1219] px-6 text-center">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-slate-500">
        <Icon size={26} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}


function SectionHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}


// ============================================================
// Sidebar
// ============================================================

function Sidebar({
  activePage,
  setActivePage,
}) {
  const navigation = [
    {
      group: "Monitoring",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: Activity,
        },
        {
          id: "sessions",
          label: "Attack Sessions",
          icon: Crosshair,
        },
        {
          id: "telemetry",
          label: "Live Telemetry",
          icon: RadioIcon,
        },
      ],
    },
    {
      group: "Analysis",
      items: [
        {
          id: "mitre",
          label: "MITRE ATT&CK",
          icon: Target,
        },
        {
          id: "replay",
          label: "Attack Replay",
          icon: Play,
        },
        {
          id: "event-store",
          label: "Event Store",
          icon: Database,
        },
      ],
    },
    {
      group: "Infrastructure",
      items: [
        {
          id: "honeypots",
          label: "Honeypots",
          icon: Server,
        },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col border-r border-white/10 bg-[#080c11]">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <ShieldCheck size={19} />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              MIRAGE
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Defensive Security
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div
            key={section.group}
            className="mb-6"
          >
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {section.group}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setActivePage(item.id)
                    }
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "border-cyan-400/10 bg-cyan-400/10 text-cyan-300"
                        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>

                    {active && (
                      <ChevronRight
                        size={14}
                        className="ml-auto"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-3">
          <div className="flex items-center gap-2">
            <CircleDot
              size={12}
              className="text-cyan-400"
            />

            <span className="text-xs font-medium text-cyan-300">
              Lab Environment
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-4 text-slate-600">
            Mirage is running in a controlled local defensive
            environment.
          </p>
        </div>
      </div>
    </aside>
  );
}


function RadioIcon(props) {
  return <Activity {...props} />;
}


// ============================================================
// Header
// ============================================================

function Header({
  activePage,
  onRefresh,
  refreshing,
}) {
  const titles = {
    overview: "Threat Overview",
    sessions: "Attack Sessions",
    "session-detail": "Session Intelligence",
    telemetry: "Live Telemetry",
    mitre: "MITRE ATT&CK",
    replay: "Attack Replay",
    honeypots: "Honeypots",
    "event-store": "Event Store",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#080c11]/95 px-7 backdrop-blur">
      <div>
        <h1 className="text-sm font-semibold text-white">
          {titles[activePage] || "Mirage"}
        </h1>

        <p className="mt-0.5 text-[11px] text-slate-600">
          Adaptive Defensive Honeypot
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
      >
        <RefreshCw
          size={14}
          className={
            refreshing
              ? "animate-spin"
              : ""
          }
        />
        Refresh
      </button>
    </header>
  );
}


// ============================================================
// Overview
// ============================================================

function OverviewPage({
  sessions,
  events,
  onOpenSession,
}) {
  const criticalEvents = events.filter(
    (event) =>
      getSeverity(event) === "critical"
  );

  const highRiskEvents = events.filter(
    (event) =>
      getRiskValue(event) >= 65
  );

  const latestSession = sessions[0];

  const techniques = [
    ...new Set(
      events
        .map((event) => {
          const mitre = getMitre(event);
          return mitre?.technique_id;
        })
        .filter(Boolean)
    ),
  ];

  const recentEvents = [...events]
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0) -
        new Date(a.timestamp || 0)
    )
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-400/70">
          Security Operations
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-white">
          Threat Overview
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitor honeypot activity, analyze attacker behavior,
          map activity to MITRE ATT&CK and replay captured
          attack sessions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attack Sessions"
          value={sessions.length}
          icon={Crosshair}
          accent="cyan"
          subtext="Captured sessions"
        />

        <StatCard
          label="Events Captured"
          value={events.length}
          icon={Activity}
          accent="violet"
          subtext="Telemetry events"
        />

        <StatCard
          label="High / Critical"
          value={highRiskEvents.length}
          icon={ShieldAlert}
          accent="red"
          subtext="Elevated-risk events"
        />

        <StatCard
          label="MITRE Techniques"
          value={techniques.length}
          icon={Target}
          accent="orange"
          subtext="Unique mapped techniques"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-white/10 bg-[#0d1219]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recent Attack Activity
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Latest events captured by Mirage
              </p>
            </div>

            <Activity
              size={17}
              className="text-cyan-400"
            />
          </div>

          {recentEvents.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Activity}
                title="No telemetry yet"
                description="Start the Mirage honeypot and generate activity to populate the event stream."
              />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentEvents.map((event) => {
                const mitre = getMitre(event);
                const severity =
                  getSeverity(event);

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400">
                      <Terminal size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white">
                          {event.command ||
                            event.event_type ||
                            "Event"}
                        </p>

                        <Badge severity={severity}>
                          {severity}
                        </Badge>
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-600">
                        {event.behavior_category ||
                          event.behavior ||
                          "Unknown behavior"}
                        {" · "}
                        {event.source_ip ||
                          "Unknown source"}
                      </p>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p
                        className={`text-sm font-semibold ${riskStyle(
                          getRiskValue(event)
                        )}`}
                      >
                        {getRiskValue(event)}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        {mitre?.technique_id ||
                          "No MITRE"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">
                  Latest Session
                </p>

                <p className="mt-2 truncate text-sm font-semibold text-white">
                  {sessionIdOf(latestSession) ||
                    "No session"}
                </p>
              </div>

              <Crosshair
                size={18}
                className="text-cyan-400"
              />
            </div>

            {latestSession && (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase text-slate-600">
                      Source
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {latestSession.source_ip ||
                        "127.0.0.1"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase text-slate-600">
                      Service
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {latestSession.service ||
                        "ssh"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge
                    severity={sessionSeverity(
                      latestSession
                    )}
                  >
                    {sessionSeverity(
                      latestSession
                    )}
                  </Badge>

                  <span
                    className={`text-lg font-semibold ${riskStyle(
                      sessionRisk(latestSession)
                    )}`}
                  >
                    {sessionRisk(latestSession)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onOpenSession(
                      sessionIdOf(
                        latestSession
                      )
                    )
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/10 bg-cyan-400/10 py-2.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  Open Session Intelligence
                  <ArrowUpRight size={14} />
                </button>
              </>
            )}
          </div>

          <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-cyan-400"
              />
              <h3 className="text-sm font-semibold text-cyan-300">
                Defensive Status
              </h3>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Mirage is collecting controlled honeypot
              telemetry and converting observed behavior
              into security intelligence.
            </p>
          </div>
        </div>
      </div>

      {criticalEvents.length > 0 && (
        <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-semibold text-red-300">
                Elevated activity detected
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Mirage has recorded{" "}
                {criticalEvents.length} critical
                event
                {criticalEvents.length === 1
                  ? ""
                  : "s"}.
                Review the associated session and replay
                timeline for investigation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// Attack Sessions
// ============================================================

function AttackSessionsPage({
  sessions,
  onOpenSession,
}) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Crosshair}
        title="No attack sessions"
        description="Captured honeypot sessions will appear here once Mirage receives activity."
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Attack Sessions"
        description="Captured attacker interactions and session-level risk."
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1219]">
        <div className="hidden grid-cols-[1.6fr_1fr_0.7fr_0.8fr_0.7fr_auto] gap-4 border-b border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 md:grid">
          <span>Session</span>
          <span>Source</span>
          <span>Service</span>
          <span>Status</span>
          <span>Risk</span>
          <span />
        </div>

        <div className="divide-y divide-white/5">
          {sessions.map((session) => {
            const risk = sessionRisk(session);
            const severity =
              sessionSeverity(session);

            return (
              <div
                key={sessionIdOf(session)}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1.6fr_1fr_0.7fr_0.8fr_0.7fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-white">
                    {sessionIdOf(session)}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    {formatDateTime(
                      session.started_at
                    )}
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  {session.source_ip || "—"}
                </div>

                <div className="text-xs text-slate-400">
                  {session.service || "—"}
                </div>

                <div>
                  <span className="text-xs capitalize text-slate-400">
                    {session.status || "active"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${riskStyle(
                      risk
                    )}`}
                  >
                    {risk}
                  </span>

                  <Badge severity={severity}>
                    {severity}
                  </Badge>
                </div>

                <button
                  onClick={() =>
                    onOpenSession(
                      sessionIdOf(session)
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  View
                  <ChevronRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// Session Intelligence
// ============================================================

function SessionDetailPage({
  sessionId,
  onBack,
}) {
  const [details, setDetails] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getSessionDetails(
            sessionId
          );

        if (mounted) {
          setDetails(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Failed to load session intelligence"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw
          size={22}
          className="animate-spin text-cyan-400"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to sessions
        </button>

        <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-5 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  const data =
    details?.session ??
    details ??
    {};

  /*
   * Backend session detail response:
   *
   * {
   *   session: {...},
   *   intelligence: {
   *     risk: {...},
   *     attack_progression: [...]
   *   },
   *   timeline: [...]
   * }
   */

  const events = normalizeArray(
    details?.timeline,
    "timeline"
  );

  const risk =
    details?.intelligence?.risk ??
    data?.risk ??
    {};

  const progression =
    normalizeArray(
      details?.intelligence
        ?.attack_progression,
      "attack_progression"
    );

  const mitreTechniques = [
    ...new Map(
      events
        .map((event) => {
          const mitre =
            getMitre(event);

          if (
            !mitre?.technique_id
          ) {
            return null;
          }

          return [
            mitre.technique_id,
            mitre,
          ];
        })
        .filter(Boolean)
    ).values(),
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-slate-500 transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to Attack Sessions
      </button>

      <div>
        <p className="font-mono text-xs text-cyan-400">
          {sessionId}
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Session Intelligence
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Behavioral analysis and attack progression.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Risk Score"
          value={risk.score ?? 0}
          icon={ShieldAlert}
          accent="red"
          subtext={
            risk.severity ||
            "unknown"
          }
        />

        <StatCard
          label="Events"
          value={events.length}
          icon={Activity}
          accent="cyan"
        />

        <StatCard
          label="Attack Stages"
          value={progression.length}
          icon={Layers3}
          accent="violet"
        />

        <StatCard
          label="MITRE Techniques"
          value={mitreTechniques.length}
          icon={Target}
          accent="orange"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
          <SectionHeader
            title="Attack Progression"
            description="Observed behavioral stages."
          />

          {progression.length === 0 ? (
            <p className="text-xs text-slate-600">
              No progression data available.
            </p>
          ) : (
            <div className="space-y-3">
              {progression.map(
                (stage, index) => (
                  <div
                    key={`${stage.stage}-${index}`}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {stage.stage}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-600">
                        {stage.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="text-slate-700"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
          <SectionHeader
            title="MITRE ATT&CK"
            description="Techniques mapped from observed behavior."
          />

          {mitreTechniques.length === 0 ? (
            <p className="text-xs text-slate-600">
              No MITRE techniques mapped.
            </p>
          ) : (
            <div className="space-y-3">
              {mitreTechniques.map(
                (technique) => (
                  <div
                    key={
                      technique.technique_id
                    }
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs font-semibold text-cyan-300">
                        {
                          technique.technique_id
                        }
                      </span>

                      <span className="text-[10px] text-slate-600">
                        {technique.tactic}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-300">
                      {
                        technique.technique_name
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d1219]">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">
            Session Events
          </h3>
        </div>

        {events.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-600">
            No session events available.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {events.map((event, index) => {
              const mitre =
                getMitre(event);

              const severity =
                getSeverity(event);

              return (
                <div
                  key={
                    event.event_id ??
                    event.id ??
                    index
                  }
                  className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center"
                >
                  <div className="w-20 shrink-0 text-xs text-slate-600">
                    {formatTime(
                      event.timestamp
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-white">
                      {event.command ||
                        event.event_type}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-600">
                      {event.behavior_category ||
                        event.behavior ||
                        "Unknown"}
                    </p>
                  </div>

                  <Badge severity={severity}>
                    {severity}
                  </Badge>

                  <span
                    className={`text-sm font-semibold ${riskStyle(
                      getRiskValue(event)
                    )}`}
                  >
                    {getRiskValue(event)}
                  </span>

                  <span className="w-32 text-right font-mono text-[10px] text-cyan-400">
                    {mitre?.technique_id ||
                      "Not mapped"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// Live Telemetry
// ============================================================

function LiveTelemetryPage({
  events,
}) {
  const sortedEvents = [
    ...events,
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0) -
        new Date(a.timestamp || 0)
    )
    .slice(0, 50);

  const criticalCount =
    sortedEvents.filter(
      (event) =>
        getSeverity(event) ===
        "critical"
    ).length;

  const sessionCount = new Set(
    sortedEvents
      .map(
        (event) => event.session_id
      )
      .filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
              Telemetry Feed
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Live Attack Telemetry
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Latest events captured from Mirage services.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Events Captured"
          value={events.length}
          icon={Activity}
          accent="cyan"
        />

        <StatCard
          label="Critical Events"
          value={criticalCount}
          icon={ShieldAlert}
          accent="red"
        />

        <StatCard
          label="Sessions"
          value={sessionCount}
          icon={Crosshair}
          accent="violet"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d1219]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Event Stream
            </h3>

            <p className="mt-1 text-[11px] text-slate-600">
              Latest 50 telemetry events
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-cyan-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            FEED ACTIVE
          </div>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Activity}
              title="Waiting for telemetry"
              description="Generate activity against the controlled honeypot to populate this feed."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedEvents.map((event) => {
              const mitre =
                getMitre(event);

              const severity =
                getSeverity(event);

              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center"
                >
                  <div className="w-20 shrink-0 text-[11px] text-slate-600">
                    {formatTime(
                      event.timestamp
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-slate-500">
                      <Terminal size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-white">
                        {event.command ||
                          event.event_type}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-slate-600">
                        {event.source_ip ||
                          "Unknown source"}{" "}
                        ·{" "}
                        {event.service ||
                          "unknown service"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {event.behavior_category ||
                      event.behavior ||
                      "Unknown"}
                  </div>

                  <Badge severity={severity}>
                    {severity}
                  </Badge>

                  <div
                    className={`w-10 text-right text-sm font-semibold ${riskStyle(
                      getRiskValue(event)
                    )}`}
                  >
                    {getRiskValue(event)}
                  </div>

                  <div className="w-28 text-right font-mono text-[10px] text-cyan-400">
                    {mitre?.technique_id ||
                      "Not mapped"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// MITRE ATT&CK
// ============================================================

function MitrePage({
  events,
}) {
  const techniques = useMemo(() => {
    const map = new Map();

    events.forEach((event) => {
      const mitre =
        getMitre(event);

      if (!mitre?.technique_id) {
        return;
      }

      const id =
        mitre.technique_id;

      if (!map.has(id)) {
        map.set(id, {
          ...mitre,
          count: 0,
          maxRisk: 0,
          events: [],
        });
      }

      const item = map.get(id);

      item.count += 1;

      item.maxRisk = Math.max(
        item.maxRisk,
        getRiskValue(event)
      );

      item.events.push(event);
    });

    return Array.from(
      map.values()
    ).sort(
      (a, b) =>
        b.maxRisk - a.maxRisk
    );
  }, [events]);

  const tacticMap = useMemo(() => {
    const map = new Map();

    techniques.forEach(
      (technique) => {
        const tactic =
          technique.tactic ||
          "Unknown";

        map.set(
          tactic,
          (map.get(tactic) || 0) + 1
        );
      }
    );

    return Array.from(
      map.entries()
    );
  }, [techniques]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="MITRE ATT&CK"
        description="Behavior-to-technique mapping generated from captured honeypot activity."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Mapped Techniques"
          value={techniques.length}
          icon={Target}
          accent="cyan"
        />

        <StatCard
          label="Tactics"
          value={tacticMap.length}
          icon={Layers3}
          accent="violet"
        />

        <StatCard
          label="Mapped Events"
          value={techniques.reduce(
            (sum, item) =>
              sum + item.count,
            0
          )}
          icon={Activity}
          accent="orange"
        />
      </div>

      {techniques.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No MITRE mappings"
          description="Mapped techniques will appear after Mirage analyzes command activity."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {techniques.map(
              (technique) => (
                <div
                  key={
                    technique.technique_id
                  }
                  className="rounded-xl border border-white/10 bg-[#0d1219] p-5 transition hover:border-cyan-400/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
                      <Target size={17} />
                    </div>

                    <span className="font-mono text-xs font-semibold text-cyan-300">
                      {
                        technique.technique_id
                      }
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-white">
                    {
                      technique.technique_name
                    }
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">
                      {technique.tactic ||
                        "Unknown tactic"}
                    </span>

                    <span
                      className={`text-xs font-semibold ${riskStyle(
                        technique.maxRisk
                      )}`}
                    >
                      Risk {technique.maxRisk}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-[10px] uppercase tracking-wider text-slate-600">
                      Observations
                    </span>

                    <span className="text-xs text-slate-300">
                      {technique.count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
            <SectionHeader
              title="Tactic Coverage"
              description="Observed ATT&CK tactics in this environment."
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {tacticMap.map(
                ([tactic, count]) => (
                  <div
                    key={tactic}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                  >
                    <p className="text-xs font-medium text-white">
                      {tactic}
                    </p>

                    <p className="mt-2 text-xl font-semibold text-cyan-300">
                      {count}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      techniques observed
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ============================================================
// Attack Replay
// ============================================================

function AttackReplayPage({
  sessions,
}) {
  const sortedSessions =
    useMemo(
      () =>
        [...sessions].sort(
          (a, b) =>
            new Date(
              b.started_at || 0
            ) -
            new Date(
              a.started_at || 0
            )
        ),
      [sessions]
    );

  const [selectedId, setSelectedId] =
    useState("");

  const [replay, setReplay] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [playing, setPlaying] =
    useState(false);

  const [playIndex, setPlayIndex] =
    useState(0);

  useEffect(() => {
    if (
      !selectedId &&
      sortedSessions.length > 0
    ) {
      setSelectedId(
        sessionIdOf(
          sortedSessions[0]
        )
      );
    }
  }, [
    selectedId,
    sortedSessions,
  ]);

  useEffect(() => {
    let mounted = true;

    async function loadReplay() {
      if (!selectedId) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setReplay(null);
        setPlaying(false);
        setPlayIndex(0);

        const response =
          await getSessionReplay(
            selectedId
          );

        /*
         * IMPORTANT:
         * Backend response is:
         *
         * {
         *   "replay": {
         *      "session_id": "...",
         *      "event_count": 6,
         *      "timeline": [...]
         *   }
         * }
         *
         * Therefore we must unwrap response.replay.
         */
        const replayData =
          response?.replay ??
          response;

        if (mounted) {
          setReplay(
            replayData || null
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Failed to load attack replay"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReplay();

    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const timeline = Array.isArray(
    replay?.timeline
  )
    ? replay.timeline
    : [];

  useEffect(() => {
    if (
      !playing ||
      timeline.length === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setPlayIndex((current) => {
        if (
          current >=
          timeline.length - 1
        ) {
          setPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [playing, timeline.length]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Play}
        title="No replayable sessions"
        description="Generate at least one honeypot session before using Attack Replay."
      />
    );
  }

  const activeEvent =
    timeline[playIndex];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Attack Replay"
        description="Reconstruct captured attacker activity as a chronological timeline."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0d1219] p-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Play size={15} />
          Session
        </div>

        <select
          value={selectedId}
          onChange={(event) =>
            setSelectedId(
              event.target.value
            )
          }
          className="flex-1 rounded-lg border border-white/10 bg-[#080c11] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-cyan-400/30"
        >
          {sortedSessions.map(
            (session) => (
              <option
                key={sessionIdOf(
                  session
                )}
                value={sessionIdOf(
                  session
                )}
              >
                {sessionIdOf(session)} ·{" "}
                {session.source_ip ||
                  "127.0.0.1"}{" "}
                ·{" "}
                {session.service ||
                  "ssh"}
              </option>
            )
          )}
        </select>

        <button
          onClick={() => {
            setPlayIndex(0);
            setPlaying(true);
          }}
          disabled={
            timeline.length === 0
          }
          className="flex items-center justify-center gap-2 rounded-lg border border-cyan-400/10 bg-cyan-400/10 px-4 py-2.5 text-xs font-medium text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={14} />
          Play Replay
        </button>

        <button
          onClick={() => {
            setPlayIndex(0);
            setPlaying(false);
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-slate-400 hover:text-white"
        >
          <RefreshCw size={14} />
          Reset
        </button>
      </div>

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-white/10 bg-[#0d1219]">
          <RefreshCw
            size={22}
            className="animate-spin text-cyan-400"
          />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        replay && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Events"
                value={
                  replay.event_count ??
                  timeline.length
                }
                icon={Activity}
                accent="cyan"
              />

              <StatCard
                label="Duration"
                value={formatDuration(
                  replay.duration_seconds
                )}
                icon={Clock3}
                accent="violet"
              />

              <StatCard
                label="Risk Score"
                value={
                  replay?.risk?.score ??
                  0
                }
                icon={ShieldAlert}
                accent="red"
              />

              <StatCard
                label="Stages"
                value={
                  replay
                    ?.attack_progression
                    ?.length ?? 0
                }
                icon={Layers3}
                accent="orange"
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
                <SectionHeader
                  title="Replay Control"
                  description="Current event being replayed."
                />

                {activeEvent ? (
                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400">
                        Event{" "}
                        {activeEvent.sequence}
                      </span>

                      <Badge
                        severity={
                          activeEvent.severity
                        }
                      >
                        {
                          activeEvent.severity
                        }
                      </Badge>
                    </div>

                    <p className="mt-5 font-mono text-lg font-semibold text-white">
                      {activeEvent.command ||
                        activeEvent.event_type}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {activeEvent.behavior ||
                        "Unknown behavior"}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <p className="text-[10px] uppercase text-slate-600">
                          Risk
                        </p>
                        <p
                          className={`mt-1 text-lg font-semibold ${riskStyle(
                            activeEvent.risk_score
                          )}`}
                        >
                          {
                            activeEvent.risk_score
                          }
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <p className="text-[10px] uppercase text-slate-600">
                          MITRE
                        </p>
                        <p className="mt-1 font-mono text-xs text-cyan-300">
                          {activeEvent
                            ?.mitre
                            ?.technique_id ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPlaying(
                            (value) =>
                              !value
                          )
                        }
                        disabled={
                          timeline.length ===
                          0
                        }
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]"
                      >
                        {playing ? (
                          <Pause
                            size={14}
                          />
                        ) : (
                          <Play
                            size={14}
                          />
                        )}

                        {playing
                          ? "Pause"
                          : "Play"}
                      </button>

                      <span className="text-[10px] text-slate-600">
                        {playIndex + 1} /{" "}
                        {timeline.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Play}
                    title="No timeline activity"
                    description="This session does not contain replay events."
                  />
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0d1219]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Replay Timeline
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-600">
                      {timeline.length} captured events
                    </p>
                  </div>

                  <div className="font-mono text-[10px] text-cyan-400">
                    {replay.session_id}
                  </div>
                </div>

                {timeline.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={Activity}
                      title="No timeline steps"
                      description="The replay API returned no timeline events for this session."
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {timeline.map(
                      (event, index) => {
                        const active =
                          index ===
                          playIndex;

                        return (
                          <button
                            key={
                              event.event_id ??
                              `${event.sequence}-${index}`
                            }
                            onClick={() =>
                              setPlayIndex(
                                index
                              )
                            }
                            className={`flex w-full items-start gap-4 px-5 py-4 text-left transition ${
                              active
                                ? "bg-cyan-400/[0.05]"
                                : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                                active
                                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                                  : "border-white/10 bg-white/[0.02] text-slate-600"
                              }`}
                            >
                              {
                                event.sequence
                              }
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-white">
                                  {event.command ||
                                    event.event_type}
                                </span>

                                <Badge
                                  severity={
                                    event.severity
                                  }
                                >
                                  {
                                    event.severity
                                  }
                                </Badge>
                              </div>

                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
                                <span>
                                  +
                                  {formatDuration(
                                    event.relative_time_seconds
                                  )}
                                </span>

                                <span>
                                  {event.behavior ||
                                    "Unknown"}
                                </span>

                                <span>
                                  {
                                    event
                                      ?.mitre
                                      ?.technique_id ||
                                    "No MITRE"
                                  }
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-xs font-semibold ${riskStyle(
                                event.risk_score
                              )}`}
                            >
                              {
                                event.risk_score
                              }
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  );
}


// ============================================================
// Honeypots
// ============================================================

function HoneypotsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Honeypots"
        description="Controlled deception services configured in the Mirage lab."
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
                <Server size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Mirage SSH Honeypot
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  Controlled TCP deception shell
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Configured
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Bind Address
              </p>

              <p className="mt-2 font-mono text-xs text-slate-300">
                127.0.0.1
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Port
              </p>

              <p className="mt-2 font-mono text-xs text-slate-300">
                2222
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Protocol
              </p>

              <p className="mt-2 text-xs text-slate-300">
                TCP deception shell
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Telemetry
              </p>

              <p className="mt-2 text-xs text-cyan-300">
                Enabled
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
          <div className="flex items-center gap-2">
            <LockKeyhole
              size={18}
              className="text-cyan-400"
            />

            <h3 className="text-sm font-semibold text-cyan-300">
              Safety Boundary
            </h3>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            The current Mirage honeypot is bound to
            localhost and operates as a controlled
            defensive deception service. Commands are
            recorded for analysis rather than executed
            against the host operating system.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <CheckCircle2
                size={15}
                className="text-cyan-400"
              />
              Localhost bound
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <CheckCircle2
                size={15}
                className="text-cyan-400"
              />
              Command telemetry enabled
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <CheckCircle2
                size={15}
                className="text-cyan-400"
              />
              Behavior analysis enabled
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <CheckCircle2
                size={15}
                className="text-cyan-400"
              />
              MITRE mapping enabled
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <CheckCircle2
                size={15}
                className="text-cyan-400"
              />
              Session replay enabled
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
          <Terminal
            size={18}
            className="text-cyan-400"
          />

          <h3 className="mt-4 text-sm font-semibold text-white">
            Command Capture
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Captures attacker commands and associates
            them with an isolated session.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
          <Bug
            size={18}
            className="text-orange-400"
          />

          <h3 className="mt-4 text-sm font-semibold text-white">
            Behavior Analysis
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Classifies observed activity into defensive
            behavior categories and risk levels.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d1219] p-5">
          <Target
            size={18}
            className="text-violet-400"
          />

          <h3 className="mt-4 text-sm font-semibold text-white">
            ATT&CK Mapping
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Maps selected behaviors to MITRE ATT&CK
            techniques for investigation.
          </p>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// Event Store
// ============================================================

function EventStorePage({
  events,
}) {
  const [search, setSearch] =
    useState("");

  const [severity, setSeverity] =
    useState("all");

  const filteredEvents =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return [...events]
        .sort(
          (a, b) =>
            new Date(b.timestamp || 0) -
            new Date(a.timestamp || 0)
        )
        .filter((event) => {
          if (
            severity !== "all" &&
            getSeverity(event) !==
              severity
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const mitre =
            getMitre(event);

          const searchable = [
            event.command,
            event.event_type,
            event.source_ip,
            event.service,
            event.session_id,
            event.behavior_category,
            event.behavior,
            mitre?.technique_id,
            mitre?.technique_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        });
    }, [
      events,
      search,
      severity,
    ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Event Store"
        description="Search and inspect all telemetry events captured by Mirage."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0d1219] p-4 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search command, session, source, behavior or MITRE..."
            className="w-full rounded-lg border border-white/10 bg-[#080c11] py-2.5 pl-9 pr-9 text-xs text-slate-300 outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter
            size={14}
            className="text-slate-600"
          />

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value
              )
            }
            className="rounded-lg border border-white/10 bg-[#080c11] px-3 py-2.5 text-xs text-slate-300 outline-none"
          >
            <option value="all">
              All severities
            </option>
            <option value="critical">
              Critical
            </option>
            <option value="high">
              High
            </option>
            <option value="medium">
              Medium
            </option>
            <option value="low">
              Low
            </option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600">
          Showing{" "}
          <span className="text-slate-300">
            {filteredEvents.length}
          </span>{" "}
          of{" "}
          <span className="text-slate-300">
            {events.length}
          </span>{" "}
          events
        </p>

        <Database
          size={15}
          className="text-slate-700"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No matching events"
          description="Try changing the search query or severity filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1219]">
          <div className="hidden grid-cols-[80px_1.3fr_1fr_0.8fr_0.8fr_0.7fr] gap-4 border-b border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 lg:grid">
            <span>Time</span>
            <span>Event</span>
            <span>Behavior</span>
            <span>Source</span>
            <span>Severity</span>
            <span>MITRE</span>
          </div>

          <div className="divide-y divide-white/5">
            {filteredEvents.map(
              (event) => {
                const mitre =
                  getMitre(event);

                const eventSeverity =
                  getSeverity(event);

                return (
                  <div
                    key={event.id}
                    className="grid gap-3 px-5 py-4 lg:grid-cols-[80px_1.3fr_1fr_0.8fr_0.8fr_0.7fr] lg:items-center lg:gap-4"
                  >
                    <div className="text-[11px] text-slate-600">
                      {formatTime(
                        event.timestamp
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-white">
                        {event.command ||
                          event.event_type}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-slate-600">
                        {event.session_id ||
                          "No session"}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400">
                      {event.behavior_category ||
                        event.behavior ||
                        "Unknown"}
                    </div>

                    <div className="text-xs text-slate-500">
                      {event.source_ip ||
                        "—"}
                    </div>

                    <div>
                      <Badge
                        severity={
                          eventSeverity
                        }
                      >
                        {eventSeverity}
                      </Badge>
                    </div>

                    <div className="font-mono text-[10px] text-cyan-400">
                      {mitre?.technique_id ||
                        "—"}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// App
// ============================================================

export default function App() {
  const [activePage, setActivePage] =
    useState("overview");

  const [sessions, setSessions] =
    useState([]);

  const [events, setEvents] =
    useState([]);

  const [selectedSession, setSelectedSession] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  async function refreshData(
    showSpinner = false
  ) {
    try {
      if (showSpinner) {
        setRefreshing(true);
      }

      const [
        sessionData,
        eventData,
      ] = await Promise.all([
        getSessions(),
        getEvents(),
      ]);

      setSessions(
        normalizeArray(
          sessionData,
          "sessions"
        )
      );

      setEvents(
        normalizeArray(
          eventData,
          "events"
        )
      );

      setError("");
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load Mirage telemetry"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    let mounted = true;

    async function initialLoad() {
      try {
        const [
          sessionData,
          eventData,
        ] = await Promise.all([
          getSessions(),
          getEvents(),
        ]);

        if (!mounted) {
          return;
        }

        setSessions(
          normalizeArray(
            sessionData,
            "sessions"
          )
        );

        setEvents(
          normalizeArray(
            eventData,
            "events"
          )
        );

        setError("");
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Failed to connect to Mirage API"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    /*
     * Polling keeps Live Telemetry and Event Store
     * updated without requiring a manual refresh.
     */
    const interval = setInterval(
      async () => {
        try {
          const [
            sessionData,
            eventData,
          ] = await Promise.all([
            getSessions(),
            getEvents(),
          ]);

          if (!mounted) {
            return;
          }

          setSessions(
            normalizeArray(
              sessionData,
              "sessions"
            )
          );

          setEvents(
            normalizeArray(
              eventData,
              "events"
            )
          );
        } catch {
          // Keep the existing UI data if a polling request fails.
        }
      },
      3000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);


  function openSession(sessionId) {
    setSelectedSession(
      sessionId
    );

    setActivePage(
      "session-detail"
    );
  }


  function renderPage() {
    if (loading) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-cyan-400"
            />

            <p className="mt-3 text-xs text-slate-600">
              Loading Mirage telemetry...
            </p>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case "overview":
        return (
          <OverviewPage
            sessions={sessions}
            events={events}
            onOpenSession={
              openSession
            }
          />
        );

      case "sessions":
        return (
          <AttackSessionsPage
            sessions={sessions}
            onOpenSession={
              openSession
            }
          />
        );

      case "session-detail":
        return (
          <SessionDetailPage
            sessionId={
              selectedSession
            }
            onBack={() =>
              setActivePage(
                "sessions"
              )
            }
          />
        );

      case "telemetry":
        return (
          <LiveTelemetryPage
            events={events}
          />
        );

      case "mitre":
        return (
          <MitrePage
            events={events}
          />
        );

      case "replay":
        return (
          <AttackReplayPage
            sessions={sessions}
          />
        );

      case "honeypots":
        return <HoneypotsPage />;

      case "event-store":
        return (
          <EventStorePage
            events={events}
          />
        );

      default:
        return (
          <OverviewPage
            sessions={sessions}
            events={events}
            onOpenSession={
              openSession
            }
          />
        );
    }
  }


  return (
    <div className="min-h-screen bg-[#080c11] text-slate-200">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="pl-[250px]">
        <Header
          activePage={activePage}
          onRefresh={() =>
            refreshData(true)
          }
          refreshing={refreshing}
        />

        <main className="min-h-[calc(100vh-64px)] px-7 py-7">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div className="min-w-0">
                <p className="text-xs font-medium text-red-300">
                  Mirage API connection issue
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {renderPage()}
        </main>
      </div>
    </div>
  );
}