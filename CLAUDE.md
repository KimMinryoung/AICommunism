# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A simulation web game with Node.js/Express backend and React frontend. Korean language content.

## Commands

### Development
```bash
npm run dev              # Run both server and client concurrently
npm run server           # Run backend only (port 3001)
npm run client           # Run frontend only (port 3000)
npm run install:all      # Install deps for root, server, and client
```

### Server (from /server)
```bash
npm run dev              # Nodemon with auto-reload
npm run lint             # ESLint checking
```


### Client (from /client)
```bash
npm start                # Development server
npm run build            # Production build
```

## Architecture

### Backend (`/server`)
- **Entry**: `src/index.js` - Express server on port 3001 with CORS
- **Routes**: `src/routes/game.js` - API endpoints for game state management
- **Game Engine**: `src/game/GameEngine.js` - Core logic for state, conditions, effects, save/load
- **SceneBuilder**: `src/game/SceneBuilder.js` - Helper for defining scenes with auto-generated action IDs

### Story Data (Logic/Text Separation)



### Frontend (`/client`)
- **App.js**: Main container with game state logic
- **Components**: StartScreen (menu), GameScreen (gameplay UI), Minimap (3x5 location grid)
- **API Client**: `src/api/gameApi.js`

## Game Systems

### State Management


### Text Formatting (Client-side)
- `[text]` - Status messages
- `{{item}}` - Item highlights
- `**text**` - Bold
- `!!text!!` - Danger/warning

## API Endpoints
- `POST /api/game/start` - New game session (loads previous unlocked endings only)
- `POST /api/game/action` - Perform action
- `GET /api/game/state/:sessionId` - Get current state
- `POST /api/game/save` / `POST /api/game/load` - Local persistence
- `POST /api/game/cloud-save` - Cloud save (full game state, manual save)
- `POST /api/game/cloud-save-endings` - Cloud save endings only (auto-save on new ending)
- `POST /api/game/cloud-load` - Cloud load (full game state, manual load)
- `GET /api/game/endings` - Fetch endings

### Save/Load System
The save system separates **unlocked endings** from **game state** to prevent auto-saves from overwriting manual save points:

| Trigger | What's Saved | Endpoint |
|---------|--------------|----------|
| New ending reached (auto) | `unlockedEndings` only | `cloud-save-endings` |
| Save button (manual) | Full game state | `cloud-save` |
| Load button (manual) | Full game state | `cloud-load` |
| New game start | Loads `unlockedEndings` only | `start` |

This ensures that viewing an ending doesn't overwrite the player's manually saved checkpoint.

## Deployment
- Backend: Render (AIcommunismserver.onrender.com)
- Frontend: Render (AIcommunism.onrender.com)

## Caution
- When running bash commands on Windows, use /dev/null for output redirection, not nul.