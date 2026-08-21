import { useEffect, useMemo, useState } from "react";
import programs from './data/events'
import openlake from "./assets/openlake.png";
/* ---------------------------------------------------
   DATE HELPERS
--------------------------------------------------- */

function formatDate(date) {
  if (!date) return "Timeline varies";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNextMilestone(milestones) {
  const now = Date.now();

  return (
    milestones.find(
      (milestone) =>
        new Date(milestone.date).getTime() > now
    ) || null
  );
}

function getTimeLeft(date) {
  if (!date) return null;

  const difference =
    new Date(date).getTime() - Date.now();

  if (difference <= 0) return null;

  return {
    days: Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

/* ---------------------------------------------------
   COUNTDOWN
--------------------------------------------------- */

function Countdown({ date }) {
  const [time, setTime] = useState(
    () => getTimeLeft(date)
  );

  useEffect(() => {
    if (!date) return;

    const timer = setInterval(() => {
      setTime(getTimeLeft(date));
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  if (!date) {
    return (
      <div className="no-countdown">
        TIMELINE VARIES
      </div>
    );
  }

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
        <strong>{time.days}</strong>
        <span>DAYS</span>
      </div>

      <div>
        <strong>
          {String(time.hours).padStart(2, "0")}
        </strong>
        <span>HOURS</span>
      </div>

      <div>
        <strong>
          {String(time.minutes).padStart(2, "0")}
        </strong>
        <span>MIN</span>
      </div>

      <div>
        <strong>
          {String(time.seconds).padStart(2, "0")}
        </strong>
        <span>SEC</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   CALENDAR
--------------------------------------------------- */

function Calendar({ date }) {
  if (!date) {
    return (
      <div className="calendar calendar-empty">
        <div className="calendar-empty-title">
          Timeline varies
        </div>

        <div className="calendar-empty-text">
          Official dates will appear here.
        </div>
      </div>
    );
  }

  const eventDate = new Date(date);

  const year = eventDate.getFullYear();
  const month = eventDate.getMonth();
  const eventDay = eventDate.getDate();

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const monthName =
    eventDate.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

  return (
    <div className="calendar">

      <div className="calendar-header">
        <span>{monthName}</span>
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
          { length: firstDay },
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="calendar-day empty"
            />
          )
        )}

        {Array.from(
          { length: daysInMonth },
          (_, index) => {
            const day = index + 1;

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

/* ---------------------------------------------------
   PROGRAM CARD
--------------------------------------------------- */

function ProgramCard({ program, index }) {
  const nextMilestone = getNextMilestone(
    program.milestones
  );

  const [expanded, setExpanded] = useState(false);

  return (
    <article className="program-card">

      <div className="program-number">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="program-main">

        <div className="program-meta">
          <span className="program-tag">
            {program.tag}
          </span>

          {nextMilestone && (
            <span className="next-label">
              NEXT · {formatDate(nextMilestone.date)}
            </span>
          )}
        </div>

        <h2>{program.name}</h2>

        <p>{program.description}</p>

        {program.note && (
          <div className="program-note">
            {program.note}
          </div>
        )}

        {nextMilestone && (
          <>
            <div className="next-milestone">
              <span>NEXT MILESTONE</span>

              <strong>
                {nextMilestone.title}
              </strong>
            </div>

            <Countdown
              date={nextMilestone.date}
            />
          </>
        )}

        <button
          className="milestone-button"
          onClick={() =>
            setExpanded(!expanded)
          }
        >
          {expanded
            ? "Hide milestones ↑"
            : `View ${program.milestones.length} milestones ↓`}
        </button>

        {expanded && (
          <div className="milestones">

            {program.milestones.map(
              (milestone, milestoneIndex) => {

                const past =
                  new Date(
                    milestone.date
                  ).getTime() < Date.now();

                return (
                  <div
                    className={`milestone ${
                      past ? "past" : ""
                    }`}
                    key={`${program.id}-${milestoneIndex}`}
                  >
                    <div className="milestone-dot">
                      {past ? "✓" : "○"}
                    </div>

                    <div>
                      <strong>
                        {milestone.title}
                      </strong>

                      <span>
                        {formatDate(
                          milestone.date
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )}

            {!program.milestones.length && (
              <div className="no-milestones">
                Official dates are not yet available.
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

/* ---------------------------------------------------
   APP
--------------------------------------------------- */

function App() {
  const [filter, setFilter] =
    useState("all");

  const visiblePrograms = useMemo(() => {

    if (filter === "all") {
      return programs;
    }

    if (filter === "upcoming") {
      return programs.filter(
        (program) =>
          getNextMilestone(
            program.milestones
          )
      );
    }

    if (filter === "active") {
      return programs.filter(
        (program) =>
          program.milestones.some(
            (milestone) =>
              new Date(
                milestone.date
              ).getTime() < Date.now()
          )
      );
    }

    return programs;

  }, [filter]);

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
          OPENLAKE · OPEN SOURCE 2026
        </span>

        <h1>
          Your contribution.
          <br />
          <span>Mapped in time.</span>
        </h1>

        <p>
          Track major open-source programs,
          application windows and contribution
          milestones — all in one place.
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
                filter === "upcoming"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("upcoming")
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
            (program, index) => (
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
            Open Source Community · IIT Bhilai
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