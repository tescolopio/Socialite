import { useState, useEffect } from 'react';
import type { NPC } from './types';
import NPCCard from './components/NPCCard';
import { randomUUID } from './utils';

const STORAGE_KEY = 'socialite_npcs';
const SHOW_BIASES_KEY = 'socialite_show_biases';

function createNPC(): NPC {
  return {
    id: randomUUID(),
    name: 'New NPC',
    portrait: null,
    biases: [],
    clockSegments: 6,
    clockFilled: 0,
    influencePoints: 0,
    notes: '',
  };
}

function loadNPCs(): NPC[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NPC[];
  } catch {
    // ignore
  }
  return [];
}

function saveNPCs(npcs: NPC[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(npcs));
}

export default function App() {
  const [npcs, setNPCs] = useState<NPC[]>(loadNPCs);
  const [showBiases, setShowBiases] = useState<boolean>(() => {
    return localStorage.getItem(SHOW_BIASES_KEY) === 'true';
  });

  useEffect(() => {
    saveNPCs(npcs);
  }, [npcs]);

  useEffect(() => {
    localStorage.setItem(SHOW_BIASES_KEY, String(showBiases));
  }, [showBiases]);

  function addNPC() {
    setNPCs((prev) => [...prev, createNPC()]);
  }

  function updateNPC(updated: NPC) {
    setNPCs((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }

  function deleteNPC(id: string) {
    setNPCs((prev) => prev.filter((n) => n.id !== id));
  }

  function resetAll() {
    if (window.confirm('Reset all NPCs? This cannot be undone.')) {
      setNPCs([]);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">⚔ Socialite</h1>
          <p className="app-subtitle">Social Encounter Dashboard</p>
        </div>
        <div className="header-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showBiases}
              onChange={(e) => setShowBiases(e.target.checked)}
            />
            Show Biases (GM mode)
          </label>
          <button className="btn-primary" onClick={addNPC}>
            + Add NPC
          </button>
          {npcs.length > 0 && (
            <button className="btn-danger" onClick={resetAll}>
              Reset All
            </button>
          )}
        </div>
      </header>

      <main className="dashboard">
        {npcs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h2>No NPCs yet</h2>
            <p>Add an NPC to start tracking social encounters.</p>
            <button className="btn-primary btn-lg" onClick={addNPC}>
              + Add First NPC
            </button>
          </div>
        ) : (
          <div className="npc-grid">
            {npcs.map((npc) => (
              <NPCCard
                key={npc.id}
                npc={npc}
                onUpdate={updateNPC}
                onDelete={deleteNPC}
                showBiases={showBiases}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

