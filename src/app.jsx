import {
  useEffect,
  useMemo,
  useState,
} from "react";

import programsMetadata from "./data/events";

import openlake from "./assets/openlake.png";

import "./index.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ============================================================
// DATE HELPERS
// ============================================================

function formatMilestoneDate(milestone) {
  // Exact date
  if (milestone.date) {
    return new Date(milestone.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Approximate date such as "March 2026"
  if (milestone.dateText) {
    return `${milestone.dateText} · approximate`;
  }

  return "Timeline varies";
}
function isMilestonePast(milestone) {
  // Exact date
  if (milestone.date) {
    return new Date(milestone.date).getTime() < Date.now();
  }

  // Approximate date such as "March 2026"
  if (milestone.dateText) {
    const approximateDate = new Date(
      `1 ${milestone.dateText}`
    );

    if (!isNaN(approximateDate.getTime())) {
      const now = new Date();

      return (
        approximateDate.getFullYear() < now.getFullYear() ||
        (
          approximateDate.getFullYear() === now.getFullYear() &&
          approximateDate.getMonth() < now.getMonth()
        )
      );
    }
  }

  return false;
}
function getNextMilestone(milestones) {
  const now = new Date();

  return (
    milestones.find((milestone) => {
      // Exact date
      if (milestone.date) {
        return new Date(milestone.date) > now;
      }

      // Approximate date: "January 2027", "March 2027", etc.
      if (milestone.dateText) {
        const approximateDate = new Date(
          `1 ${milestone.dateText}`
        );

        if (!isNaN(approximateDate.getTime())) {
          return approximateDate > now;
        }
      }

      return false;
    }) || null
  );
}

function getTimeLeft(date) {
  if (!date) {
    return null;
  }

  const target =
    new Date(date).getTime();

  const difference =
    target - Date.now();

  if (difference <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(
    difference / 1000
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

// ============================================================
// COUNTDOWN
// ============================================================

function Countdown({ date }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () =>
      clearInterval(interval);
  }, []);

  const time =
    getTimeLeft(date);

  if (!time) {
    return (
      <div className="expired">
        MILESTONE REACHED
      </div>
    );
  }

  return (
    <div className="countdown">
      <div>
        <strong>
          {time.days}
        </strong>

        <span>DAYS</span>
      </div>

      <div>
        <strong>
          {String(
            time.hours
          ).padStart(2, "0")}
        </strong>

        <span>HOURS</span>
      </div>

      <div>
        <strong>
          {String(
            time.minutes
          ).padStart(2, "0")}
        </strong>

        <span>MIN</span>
      </div>

      <div>
        <strong>
          {String(
            time.seconds
          ).padStart(2, "0")}
        </strong>

        <span>SEC</span>
      </div>
    </div>
  );
}

// ============================================================
// CALENDAR
// ============================================================

function Calendar({ date }) {
  if (!date) {
    return (
      <div className="calendar calendar-empty">
        <div className="calendar-empty-title">
          Timeline varies
        </div>

        <div className="calendar-empty-text">
          No upcoming exact date.
        </div>
      </div>
    );
  }

  const eventDate =
    new Date(date);

  if (
    Number.isNaN(
      eventDate.getTime()
    )
  ) {
    return null;
  }

  const year =
    eventDate.getFullYear();

  const month =
    eventDate.getMonth();

  const eventDay =
    eventDate.getDate();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const monthName =
    eventDate.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    <div className="calendar">
      <div className="calendar-header">
        <span>
          {monthName}
        </span>

        <span>📅</span>
      </div>

      <div className="weekdays">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      <div className="calendar-grid">
        {Array.from(
          {
            length: firstDay,
          },
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="calendar-day empty"
            />
          )
        )}

        {Array.from(
          {
            length:
              daysInMonth,
          },
          (_, index) => {
            const day =
              index + 1;

            return (
              <div
                key={day}
                className={
                  day === eventDay
                    ? "calendar-day event-day"
                    : "calendar-day"
                }
              >
                {day}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

// ============================================================
// PROGRAM CARD
// ============================================================

function ProgramCard({
  program,
  index,
}) {
  
  const nextMilestone =
    getNextMilestone(
      program.milestones
    );

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  return (
    <article className="program-card">
      <div className="program-number">
        {String(
          index + 1
        ).padStart(2, "0")}
      </div>

      <div className="program-main">
        <div className="program-meta">
          <span className="program-tag">
            {program.tag}
          </span>

          {nextMilestone && (
            <span className="next-label">
              NEXT ·{" "}
              {formatMilestoneDate(nextMilestone)}
            </span>
          )}
        </div>

        <h2>
          {program.name}
        </h2>

        <p>
          {program.description}
        </p>

        {program.note && (
          <div className="program-note">
            {program.note}
          </div>
        )}

        {nextMilestone && (
          <>
            <div className="next-milestone">
              <span>
                NEXT MILESTONE
              </span>

              <strong>
                {
                  nextMilestone.title
                }
              </strong>
            </div>

            <Countdown
              date={
                nextMilestone.date
              }
            />
          </>
        )}

        <button
          className="milestone-button"
          onClick={() =>
            setExpanded(
              !expanded
            )
          }
        >
          {expanded
            ? "Hide milestones ↑"
            : `View ${program.milestones.length} milestones ↓`}
        </button>

        {expanded && (
          <div className="milestones">
            {program.milestones.map(
              (
                milestone,
                milestoneIndex
              ) => {
                const past = isMilestonePast(milestone);

                return (
                  <div
                    className={`milestone ${past
                      ? "past"
                      : ""
                      }`}
                    key={`${program.id}-${milestoneIndex}`}
                  >
                    <div className="milestone-dot">
                      {past
                        ? "✓"
                        : "○"}
                    </div>

                    <div>
                      <strong>
                        {
                          milestone.title
                        }
                      </strong>

                      <span>
                        {formatMilestoneDate(milestone)}
                      </span>
                    </div>
                  </div>
                );
              }
            )}

            {!program.milestones
              .length && (
                <div className="no-milestones">
                  Official dates are
                  not yet available.
                </div>
              )}
          </div>
        )}
      </div>

      <Calendar
        date={
          nextMilestone
            ? nextMilestone.date
            : null
        }
      />
    </article>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  const [
    programs,
    setPrograms,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    filter,
    setFilter,
  ] = useState("all");

  // ----------------------------------------------------------
  // FETCH BACKEND DATA
  // ----------------------------------------------------------

  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/programs`
          );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          throw new Error(
            "Backend request failed"
          );
        }

        const backendPrograms =
          data.results || [];

        /*
         * Preserve the order and metadata
         * from events.js.
         */

        const merged =
          programsMetadata.map(
            (metadata) => {
              const backend =
                backendPrograms.find(
                  (item) =>
                    item.sourceId ===
                    metadata.id
                );

              if (!backend) {
                return {
                  ...metadata,
                  milestones: [],
                };
              }

              return {
                ...metadata,

                description:
                  backend.description ||
                  metadata.description,

                milestones:
                  backend.milestones ||
                  [],

                extractionMethod:
                  backend.extractionMethod,

                error:
                  backend.error,

                lastSuccessfulUpdate:
                  backend.lastSuccessfulUpdate,
              };
            }
          );

        setPrograms(merged);
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
          "Unable to load programs."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPrograms();
  }, []);

  // ----------------------------------------------------------
  // FILTER
  // ----------------------------------------------------------

  const visiblePrograms =
    useMemo(() => {
      if (filter === "all") {
        return programs;
      }

      if (
        filter === "upcoming"
      ) {
        return programs.filter(
          (program) =>
            getNextMilestone(
              program.milestones
            )
        );
      }

      if (
        filter === "active"
      ) {
        return programs.filter(
          (program) =>
            program.milestones.some(
              (milestone) =>
                milestone.date &&
                new Date(
                  milestone.date
                ).getTime() <
                Date.now()
            )
        );
      }

      return programs;
    }, [filter, programs]);

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">
            <img
              src={openlake}
              alt="OpenLake"
              className="logo-image"
            />

            <span>
              OpenLake
            </span>
          </div>
        </nav>

        <main className="timeline-section">
          <div className="loading">
            Loading program
            timelines...
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  if (error) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">
            <img
              src={openlake}
              alt="OpenLake"
              className="logo-image"
            />

            <span>
              OpenLake
            </span>
          </div>
        </nav>

        <main className="timeline-section">
          <div className="error-message">
            Unable to load program
            data.

            <br />

            <small>
              {error}
            </small>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div className="app">
      {/* NAVIGATION */}

      <nav className="navbar">
        <div className="logo">
          <img
            src={openlake}
            alt="OpenLake"
            className="logo-image"
          />

          <span>
            OpenLake
          </span>
        </div>

        <a
          href="https://github.com/OpenLake"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </nav>

      {/* HERO */}

      <header className="hero">
        <span className="hero-label">
          OPENLAKE · OPEN SOURCE
          2026
        </span>

        <h1>
          Your contribution.
          <br />

          <span>
            Mapped in time.
          </span>
        </h1>

        <p>
          Track major
          open-source programs,
          application windows and
          contribution milestones
          — all in one place.
        </p>

        <div className="hero-line" />
      </header>

      {/* PROGRAMS */}

      <main className="timeline-section">
        <div className="section-header">
          <div>
            <span className="small-label">
              PROGRAM CALENDAR
            </span>

            <h2>
              The open-source year
            </h2>
          </div>

          <div className="filters">
            <button
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              className={
                filter ===
                  "upcoming"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  "upcoming"
                )
              }
            >
              Upcoming
            </button>

            <button
              className={
                filter === "active"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("active")
              }
            >
              Active
            </button>
          </div>
        </div>

        <div className="events">
          {visiblePrograms.map(
            (
              program,
              index
            ) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index}
              />
            )
          )}
        </div>
      </main>

      {/* FOOTER */}

      <footer>
        <div>
          <strong>
            OpenLake
          </strong>

          <span>
            Open Source Community
            · IIT Bhilai
          </span>
        </div>

        <span>
          Built for contributors.
        </span>
      </footer>
    </div>
  );
}

export default App;