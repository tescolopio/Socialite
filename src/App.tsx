import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { NPC } from './types';
import NPCCard from './components/NPCCard';
import { parseNPCDocument, serializeNPCDocument } from './npcDocument';
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
    if (!raw) {
      return [];
    }
    return parseNPCDocument(raw);
  } catch {
    // ignore parse/shape errors and fall back to empty list
  }
  return [];
}

function saveNPCs(npcs: NPC[]) {
  try {
    localStorage.setItem(STORAGE_KEY, serializeNPCDocument(npcs));
  } catch {
    // If saving fails (e.g., quota exceeded or storage disabled), skip persisting NPCs.
  }
}

export default function App() {
  const importFileRef = useRef<HTMLInputElement>(null);
  const [npcs, setNPCs] = useState<NPC[]>(loadNPCs);
  const [showBiases, setShowBiases] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SHOW_BIASES_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      saveNPCs(npcs);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
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

  function exportNPCs() {
    const blob = new Blob([serializeNPCDocument(npcs)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'socialite-npcs.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleImportNPCs(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const importedNPCs = parseNPCDocument(await file.text());

      if (importedNPCs.length === 0) {
        window.alert(
          'No NPCs found in the uploaded file. Please ensure the JSON contains an "npcs" array with NPC objects, or is an array of NPC objects at the root level.',
        );
        return;
      }

      if (
        npcs.length > 0 &&
        !window.confirm('Replace the current NPCs with the uploaded JSON file?')
      ) {
        return;
      }

      setNPCs(importedNPCs);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to import NPC JSON. Please try again.';
      window.alert(message);
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
          <input
            ref={importFileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleImportNPCs}
          />
          <button type="button" className="btn-sm" onClick={() => importFileRef.current?.click()}>
            Import JSON
          </button>
          <button type="button" className="btn-sm" onClick={exportNPCs} disabled={npcs.length === 0}>
            Export JSON
          </button>
          <button type="button" className="btn-primary" onClick={addNPC}>
            + Add NPC
          </button>
          {npcs.length > 0 && (
            <button type="button" className="btn-danger" onClick={resetAll}>
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
              <button type="button" className="btn-primary btn-lg" onClick={addNPC}>
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
