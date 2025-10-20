// DATA ENTRY FORM

// Import react, hooks and utilities
import React, { useEffect, useMemo, useRef, useState } from "react";
import { fmtHMS, parseHMS, calcPaceSec, secondsToPace } from "../utils/time.js";

// default values
const emptyDraft = { date: "", distance: "", time: "", mood: "active", weight: "" };
const DRAFT_KEY = "run_draft_v1";

//Component function
export default function MultiStepForm({ onSubmit, editingRun, onCancelEdit }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY)) || emptyDraft;
    } catch {
      return emptyDraft;
    }
  });

  // Refs for auto-focus
  const dateRef = useRef(null);
  const distanceRef = useRef(null);
  const timeRef = useRef(null);
  const moodRef = useRef(null);
  const weightRef = useRef(null);

  // --- TIME INPUT AUTOFORMAT (hh:mm:ss) ---
  const [timeDigits, setTimeDigits] = useState(""); // only digits (max 6)

  function formatFromDigits6(d) {
    const s = d.padStart(6, "0").slice(-6); // HHMMSS
    const hh = s.slice(0, 2);
    const mm = s.slice(2, 4);
    const ss = s.slice(4, 6);
    return `${hh}:${mm}:${ss}`;
  }

  //EVENT HANDLERS

  function handleTimeKeyDown(e) {
    const k = e.key;

    // digits= append, keep last 6
    if (/^[0-9]$/.test(k)) {
      e.preventDefault();
      const nextDigits = (timeDigits + k).slice(-6);
      setTimeDigits(nextDigits);
      setDraft({ ...draft, time: formatFromDigits6(nextDigits) });
      return;
    }

    // backspace= remove last digit
    if (k === "Backspace") {
      e.preventDefault();
      const nextDigits = timeDigits.slice(0, -1);
      setTimeDigits(nextDigits);
      setDraft({
        ...draft,
        time: nextDigits ? formatFromDigits6(nextDigits) : "",
      });
      return;
    }

  }

  // Derived pace preview
  const pacePreview = useMemo(() => {
    if (!draft.distance || !draft.time) return "";
    const sec = parseHMS(draft.time);
    if (Number.isNaN(sec) || sec <= 0) return "";
    const pace = calcPaceSec(sec, Number(draft.distance));
    return secondsToPace(pace) + " /mi";
  }, [draft.distance, draft.time]);

  // Effects. Autosave draft on change
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  // auto-focus active input when step changes
  useEffect(() => {
    switch (step) {
      case 0:
        dateRef.current?.focus();
        break;
      case 1:
        distanceRef.current?.focus();
        break;
      case 2:
        timeRef.current?.focus();
        break;
      case 3:
        moodRef.current?.focus();
        break;
      case 4:
        weightRef.current?.focus();
        break;
      default:
        break;
    }
  }, [step]);

  // allow Enter key to move to next step (or save on last)
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName; // "INPUT", "SELECT"
      if (e.key === "Enter" && (tag === "INPUT" || tag === "SELECT")) {
        e.preventDefault();
        if (step < 4) setStep((s) => s + 1);
        else handleSubmit();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, draft]); // step for navigation, draft so latest data is saved

  // reset the time-digit buffer when landing on the Time step
  useEffect(() => {
    if (step === 2) {
      const onlyDigits = (draft.time || "").replace(/\D/g, "");
      setTimeDigits(onlyDigits.slice(-6));
    }
  }, [step, draft.time]);

   useEffect(() => {
    if (!editingRun) return
    setStep(0) // start at the first step
    setDraft({
      date: editingRun.date,
      distance: String(editingRun.distance),
      time: fmtHMS(editingRun.timeSec),      // convert seconds -> "hh:mm:ss"
      mood: editingRun.mood ?? 'active',
      weight: editingRun.weight ?? ''
    })
        // also sync the time digit buffer if you’re using the hh:mm:ss auto-format:
    const onlyDigits = fmtHMS(editingRun.timeSec).replace(/\D/g, '')
    setTimeDigits(onlyDigits.slice(-6))
    }, [editingRun])

    //FUNCTIONS

  function next() {
    setStep((s) => Math.min(s + 1, 4));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(e) {
    e?.preventDefault();

    // Validate minimal fields; jump back to the missing one
    if (!draft.date) {
      alert("Please choose a date");
      setStep(0);
      return;
    }

    const distance = Number(draft.distance);
    if (!distance || distance <= 0) {
      alert("Enter a valid distance (miles)");
      setStep(1);
      return;
    }

    const totalSec = parseHMS(draft.time);
    if (Number.isNaN(totalSec) || totalSec <= 0) {
      alert("Enter a valid time (hh:mm:ss)");
      setStep(2);
      return;
    }

    // Construct normalized entry
    const paceSec = calcPaceSec(totalSec, distance);
    const entry = {
      id: crypto.randomUUID(),
      date: draft.date, // YYYY-MM-DD
      distance,
      timeSec: totalSec,
      paceSec,
      speedMph: Number((distance / (totalSec / 3600)).toFixed(2)),
      mood: draft.mood || undefined,
      weight: draft.weight ? Number(draft.weight) : undefined,
    };

    onSubmit(entry);

    // reset
    setDraft(emptyDraft);
    localStorage.removeItem(DRAFT_KEY);
    setTimeDigits("");
    setStep(0);
  }
  

  // RENDER (JSX UI)
  return (
    <form className="multistep" onSubmit={handleSubmit}>
      <ol className="steps">
        {["Date", "Distance", "Time", "Mood", "Weight"].map((label, i) => (
          <li key={i}>
            <button
              type="button"
              className={`stepBtn ${step === i ? "active" : ""}`}
              onClick={() => setStep(i)}
            >
              {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="step">
          <label>Date</label>
          <input
            ref={dateRef}
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
          <div className="next">
            <button type="button" onClick={next}>Next</button>
            {editingRun && <button type="submit">Save changes</button>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="step">
          <label>Distance (miles)</label>
          <input
            ref={distanceRef}
            type="number"
            min="0"
            step="0.01"
            value={draft.distance}
            onChange={(e) =>
              setDraft({ ...draft, distance: e.target.value })
            }
          />
          <div className="next">
            <button type="button" onClick={next}>Next</button>
            {editingRun && <button type="submit">Save changes</button>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <label>Time (hh:mm:ss)</label>
          <input
            ref={timeRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="hh:mm:ss"
            value={draft.time}
            onKeyDown={handleTimeKeyDown}
            onChange={() => {}}
          />
          {!!pacePreview && (
            <p className="muted">
              Pace preview: <strong>{pacePreview}</strong>
            </p>
          )}
          <div className="next">
            <button type="button" onClick={next}>Next</button>
            {editingRun && <button type="submit">Save changes</button>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <label>Mood</label>
          <select
            ref={moodRef}
            value={draft.mood}
            onChange={(e) => setDraft({ ...draft, mood: e.target.value })}
          >
            <option value="energetic">😀 Energetic</option>
            <option value="active">🙂 Active</option>
            <option value="slow">😐 Slow</option>
            <option value="tired">🙁 Tired</option>
          </select>
          <div className="next">
            <button type="button" onClick={next}>Next</button>
            {editingRun && <button type="submit">Save changes</button>}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <label>Weight (lbs) – optional</label>
          <input
            ref={weightRef}
            type="number"
            min="0"
            step="0.1"
            value={draft.weight}
            onChange={(e) =>
              setDraft({ ...draft, weight: e.target.value })
            }
          />
          <div className="next">
              {editingRun && (
              <button type="button" className="secondary" onClick={onCancelEdit}>
                Cancel Edit
              </button>
            )}
            <button type="submit">{editingRun ? 'Update Run' : 'Save Run'}</button>
          </div>
        </div>
      )}
    </form>
  );
}
