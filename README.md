# battleship

A browser implementation of the classic Battleship game built with **vanilla JavaScript** and bundled using **Webpack**.
This project focuses on a modular architecture separating **game logic, state management, and UI rendering**.

## Live Demo

[View on GitHub Pages](https://sai-eshwar-supreet.github.io/battleship/)

## Overview

The application implements the classic Battleship rules:

- Player places ships on a grid
- The computer places ships automatically
- Players take turns attacking coordinates
- Ships track hits and become sunk when fully damaged
- The game ends when all ships of one side are destroyed

The game is played against a computer opponent with configurable difficulty.

## Architecture

The project is structured into clear layers.

- ### Core
  - General purpose infrastructure used across the project.
  - State machine implementation
  - Event system
  - Math utilities (Vector2Int)
  - Random number utilities
  - Validation helpers

- ### Game
  - Contains the domain logic and gameplay systems.
  - **Entities:** Domain objects representing the game world. (Ship, Cell, GameBoard, Player)
  - **Systems:** Game mechanics implemented as modular systems. (Placement system, Combat system)
  - **State Management:** Game phases implemented as explicit states. A controller coordinates these states through a state machine. (MenuState, PreGameState, PlacementState, CombatState)
  - **UI:** Handles DOM rendering and user interactions. Views remain independent of the game logic and communicate through event handlers. (MenuView, PlacementView, CombatView)

## Technologies Used

- JavaScript
- Webpack
- HTML
- CSS
- Jest

## Running Locally

```
git clone https://github.com/Sai-Eshwar-Supreet/battleship.git
cd battleship
npm install
npx webpack serve
```

Open:

```
http://localhost:8080
```

## Production Build

```
npm run build
```

## Deployment

```
npm run deploy
```

## Acknowledgements

- This project was completed as part of **[The Odin Project – JavaScript Course](https://www.theodinproject.com/)**
