import React, { useRef, useState } from 'react';
import type { NPC, Bias } from '../types';
import ProgressClock from './ProgressClock';
import { randomUUID } from '../utils';

interface NPCCardProps {
  npc: NPC;
  onUpdate: (updated: NPC) => void;
  onDelete: (id: string) => void;
  showBiases: boolean;
}

function BiasBar({ bias }: { bias: Bias }) {
  const pct = ((bias.value + 5) / 10) * 100;
  const color =
    bias.value > 0 ? '#4caf50' : bias.value < 0 ? '#f44336' : '#888';
  return (
    <div className="bias-item">
      <span className="bias-label">{bias.label}</span>
      <div className="bias-track">
        <div
          className="bias-fill"
          style={{ width: `${pct}%`, background: color }}
          title={`${bias.value > 0 ? '+' : ''}${bias.value}`}
        />
      </div>
      <span className="bias-value">
        {bias.value > 0 ? '+' : ''}
        {bias.value}
      </span>
    </div>
  );
}

export default function NPCCard({
  npc,
  onUpdate,
  onDelete,
  showBiases,
}: NPCCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(npc.name);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(npc.notes);
  const [showBiasEditor, setShowBiasEditor] = useState(false);
  const [newBiasLabel, setNewBiasLabel] = useState('');
  const [newBiasValue, setNewBiasValue] = useState(0);

  function handlePortraitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ ...npc, portrait: reader.result as string });
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  }

  function handleClockToggle(index: number) {
    // Click filled segment to unfill from that segment onward;
    // click empty segment to fill up to that segment.
    let newFilled: number;
    if (index < npc.clockFilled) {
      newFilled = index; // unfill this and all after
    } else {
      newFilled = index + 1; // fill up to and including this segment
    }
    onUpdate({ ...npc, clockFilled: newFilled });
  }

  function handleSegmentChange(segments: number) {
    onUpdate({
      ...npc,
      clockSegments: segments,
      clockFilled: Math.min(npc.clockFilled, segments),
    });
  }

  function handleInfluenceChange(delta: number) {
    onUpdate({ ...npc, influencePoints: Math.max(0, npc.influencePoints + delta) });
  }

  function commitName() {
    setEditingName(false);
    if (nameInput.trim()) onUpdate({ ...npc, name: nameInput.trim() });
    else setNameInput(npc.name);
  }

  function commitNotes() {
    setEditingNotes(false);
    onUpdate({ ...npc, notes: notesInput });
  }

  function addBias() {
    if (!newBiasLabel.trim()) return;
    const bias: Bias = {
      id: randomUUID(),
      label: newBiasLabel.trim(),
      value: newBiasValue,
    };
    onUpdate({ ...npc, biases: [...npc.biases, bias] });
    setNewBiasLabel('');
    setNewBiasValue(0);
  }

  function updateBiasValue(id: string, value: number) {
    onUpdate({
      ...npc,
      biases: npc.biases.map((b) => (b.id === id ? { ...b, value } : b)),
    });
  }

  function removeBias(id: string) {
    onUpdate({ ...npc, biases: npc.biases.filter((b) => b.id !== id) });
  }

  return (
    <article className="npc-card">
      {/* Portrait */}
      <div
        className="npc-portrait"
        onClick={() => fileRef.current?.click()}
        title="Click to upload portrait"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        aria-label="Upload NPC portrait"
      >
        {npc.portrait ? (
          <img src={npc.portrait} alt={`Portrait of ${npc.name}`} />
        ) : (
          <span className="portrait-placeholder">📷 Upload Portrait</span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePortraitChange}
        />
      </div>

      {/* Name */}
      <div className="npc-name-row">
        {editingName ? (
          <input
            className="name-input"
            value={nameInput}
            autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') {
                setNameInput(npc.name);
                setEditingName(false);
              }
            }}
            aria-label="NPC name"
          />
        ) : (
          <button
            type="button"
            className="npc-name"
            onClick={() => setEditingName(true)}
            title="Click to edit name"
          >
            {npc.name}
          </button>
        )}
        <button
          className="btn-icon btn-delete"
          onClick={() => onDelete(npc.id)}
          title="Remove NPC"
          aria-label={`Remove ${npc.name}`}
        >
          ✕
        </button>
      </div>

      {/* Progress Clock */}
      <section className="clock-section" aria-label="Progress Clock">
        <div className="section-header">
          <span className="section-title">Progress Clock</span>
          <select
            value={npc.clockSegments}
            onChange={(e) => handleSegmentChange(Number(e.target.value))}
            className="segments-select"
            aria-label="Number of clock segments"
          >
            {[4, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n} segments
              </option>
            ))}
          </select>
        </div>
        <ProgressClock
          segments={npc.clockSegments}
          filled={npc.clockFilled}
          onToggle={handleClockToggle}
        />
        <p className="clock-hint">Click segments to fill / unfill</p>
      </section>

      {/* Influence Points */}
      <section className="influence-section" aria-label="Influence Points">
        <span className="section-title">Influence Points</span>
        <div className="influence-controls">
          <button
            className="btn-influence"
            onClick={() => handleInfluenceChange(-1)}
            aria-label="Decrease influence"
            disabled={npc.influencePoints === 0}
          >
            −
          </button>
          <span className="influence-value" aria-live="polite">
            {npc.influencePoints}
          </span>
          <button
            className="btn-influence"
            onClick={() => handleInfluenceChange(1)}
            aria-label="Increase influence"
          >
            +
          </button>
        </div>
      </section>

      {/* Hidden Biases */}
      <section className="biases-section" aria-label="NPC Biases">
        <div className="section-header">
          <span className="section-title">
            Hidden Biases{' '}
            <span className="bias-count">({npc.biases.length})</span>
          </span>
          <button
            className="btn-sm"
            onClick={() => setShowBiasEditor((v) => !v)}
            aria-expanded={showBiasEditor}
          >
            {showBiasEditor ? 'Close' : 'Edit'}
          </button>
        </div>

        {showBiases && npc.biases.length > 0 && (
          <div className="bias-list">
            {npc.biases.map((b) => (
              <BiasBar key={b.id} bias={b} />
            ))}
          </div>
        )}

        {!showBiases && npc.biases.length > 0 && (
          <p className="bias-hidden-hint">🔒 Hidden from players</p>
        )}

        {showBiasEditor && (
          <div className="bias-editor">
            {npc.biases.map((b) => (
              <div key={b.id} className="bias-edit-row">
                <span className="bias-edit-label">{b.label}</span>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  value={b.value}
                  onChange={(e) => updateBiasValue(b.id, Number(e.target.value))}
                  aria-label={`${b.label} bias value`}
                />
                <span className="bias-edit-val">
                  {b.value > 0 ? '+' : ''}
                  {b.value}
                </span>
                <button
                  className="btn-icon"
                  onClick={() => removeBias(b.id)}
                  aria-label={`Remove ${b.label} bias`}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="bias-add-row">
              <input
                type="text"
                placeholder="Bias label…"
                value={newBiasLabel}
                onChange={(e) => setNewBiasLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBias()}
                className="bias-label-input"
                aria-label="New bias label"
              />
              <input
                type="number"
                min={-5}
                max={5}
                value={newBiasValue}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const safe = Number.isNaN(raw) ? 0 : raw;
                  const clamped = Math.max(-5, Math.min(5, safe));
                  setNewBiasValue(clamped);
                }}
                className="bias-val-input"
                aria-label="New bias value"
              />
              <button className="btn-sm btn-add" onClick={addBias}>
                Add
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="notes-section" aria-label="GM Notes">
        <span className="section-title">GM Notes</span>
        {editingNotes ? (
          <textarea
            className="notes-textarea"
            value={notesInput}
            autoFocus
            onChange={(e) => setNotesInput(e.target.value)}
            onBlur={commitNotes}
            aria-label="GM notes"
          />
        ) : (
          <p
            className="notes-display"
            onClick={() => setEditingNotes(true)}
            title="Click to edit notes"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') {
                  e.preventDefault();
                }
                setEditingNotes(true);
              }
            }}
          >
            {npc.notes || 'Click to add notes…'}
          </p>
        )}
      </section>
    </article>
  );
}
