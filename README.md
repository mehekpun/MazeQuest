# MazeQuest

MazeQuest is a maze generation and pathfinding visualizer for a Data Structures & Algorithms mini-project.

## Features
- Randomized DFS maze generation with backtracking
- BFS shortest-path search
- DFS pathfinding
- Custom stack and circular queue in C++
- Path length and explored-cell statistics
- BFS vs DFS comparison
- Responsive dark-themed UI
- Deployable as a static site on Vercel

## Run the website locally
Open `frontend/index.html` in a browser, or use VS Code Live Server.

## Deploy on Vercel
1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Set **Root Directory** to `frontend`.
4. Set Framework Preset to **Other**.
5. Leave Build Command empty and set Output Directory to `.`.
6. Click Deploy.

The deployed website is fully interactive. Since Vercel static hosting does not run a persistent native C++ process, the deployed browser uses equivalent JavaScript implementations of maze generation and pathfinding. The C++ implementation is included in `backend/main.cpp` for local compilation, study, and practical demonstration. The browser version is not a live call to the C++ executable.

## Compile the C++ DSA program
From the `backend` folder, run:

```bash
g++ main.cpp -std=c++17 -o mazequest
```

Then run `mazequest` (Windows: `.\mazequest.exe`).

## DSA concepts
- 2D arrays / grid representation
- Stack and backtracking
- Circular queue
- DFS and BFS graph traversal
- Parent tracking and path reconstruction
- Algorithm comparison
