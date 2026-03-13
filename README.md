# Socialite – Social Encounter Dashboard

A visual GM dashboard for tracking complex social negotiations using narrative mechanics like **Progress Clocks** and **Influence Points**. Built with React + TypeScript + Vite.

![Empty state](https://github.com/user-attachments/assets/b8e21c18-72a1-4327-969c-3b94543c4c72)
![Dashboard with NPCs](https://github.com/user-attachments/assets/b40e8ea4-59ba-42cd-bd6c-2f0e0f2cc27b)

## Features

- **NPC Cards** – Upload a portrait, set a name, and write GM notes for each NPC
- **Progress Clocks** – SVG pie-style clocks with 4, 6, or 8 segments; click to fill or unfill as players achieve diplomatic successes
- **Influence Points** – Track per-NPC influence with a simple +/− counter
- **Hidden Biases** – Set labeled biases on a −5 to +5 scale; shown as color-coded bar charts in GM mode, hidden from players otherwise
- **GM Mode toggle** – Reveal or conceal biases at the top-level with one checkbox
- **JSON NPC documents** – Import NPCs from a `.json` file or export the current dashboard as `socialite-npcs.json`
- **Persistence** – NPC data is stored locally using the same JSON document format automatically

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

## Usage

1. Click **+ Add NPC** to create a new NPC card
2. Click the portrait area to upload an image
3. Click the NPC name to rename it
4. Click clock segments to fill them as players succeed at roleplay
5. Use **+/−** to adjust Influence Points
6. Click **Edit** on the biases section to add / adjust hidden biases
7. Toggle **Show Biases (GM mode)** to reveal biases on screen
8. Click **GM Notes** to add private notes
9. Use **Import JSON** to load NPCs from a JSON file
10. Use **Export JSON** to download the current NPC roster as a reusable source-of-truth file
