const mazearea = document.getElementById("maze");
const sizeinput = document.getElementById("size");
const statusbox = document.getElementById("status");
const welcomescreen = document.getElementById("welcome-screen");
const workspace = document.getElementById("maze-workspace");

let rows = 21, cols = 31, grid = [];
let start = [1, 1], end = [19, 29];
let trail = [], head = [1, 1], lastResults = {};
const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

document.getElementById("start-app").addEventListener("click", () => {
  welcomescreen.hidden = true;
  workspace.hidden = false;
  makeMaze();
});
document.getElementById("back-home").addEventListener("click", () => {
  workspace.hidden = true;
  welcomescreen.hidden = false;
  closeCongratulations();
});

function makeMaze() {
  rows = Number(sizeinput.value);
  cols = rows === 11 ? 15 : rows === 21 ? 31 : 45;
  start = [1,1]; end = [rows-2, cols-2];
  head = [...start]; trail = [[...start]];
  grid = Array.from({length:rows}, () => Array(cols).fill("#"));
  const todo = [[1,1]];
  grid[1][1] = " ";
  const carveDirs = [[-2,0],[2,0],[0,-2],[0,2]];
  while (todo.length) {
    const [r,c] = todo[todo.length-1];
    const options = carveDirs.map(([dr,dc]) => [r+dr,c+dc,dr,dc])
      .filter(([nr,nc]) => nr>0 && nr<rows-1 && nc>0 && nc<cols-1 && grid[nr][nc]==="#");
    if (!options.length) { todo.pop(); continue; }
    const [nr,nc,dr,dc] = options[Math.floor(Math.random()*options.length)];
    grid[r+dr/2][c+dc/2] = " ";
    grid[nr][nc] = " ";
    todo.push([nr,nc]);
  }
  grid[start[0]][start[1]] = "S";
  grid[end[0]][end[1]] = "E";
  lastResults = {};
  closeCongratulations();
  drawMaze();
  statusbox.innerHTML = "<i></i> READY";
  document.getElementById("comparison").classList.add("hidden");
  const solutionButton = document.getElementById("show-solution");
  solutionButton.setAttribute("aria-expanded", "false");
  solutionButton.textContent = "Show solution & compare BFS vs DFS";
}

function moveHead(dr,dc) {
  if (welcomescreen.hidden === false || workspace.hidden) return;
  const nr = head[0]+dr, nc = head[1]+dc;
  if (nr<0 || nr>=rows || nc<0 || nc>=cols || grid[nr][nc]==="#") {
    statusbox.innerHTML = "<i></i> WALL BLOCKED";
    return;
  }
  if (trail.length > 1) {
    const previous = trail[trail.length-2];
    if (previous[0]===nr && previous[1]===nc) {
      trail.pop(); head = [nr,nc]; drawMaze();
      statusbox.innerHTML = "<i></i> PATH RETRACED";
      return;
    }
  }
  if (trail.some(([r,c]) => r===nr && c===nc)) {
    statusbox.innerHTML = "<i></i> RETRACE YOUR PATH";
    return;
  }
  head = [nr,nc];
  trail.push([...head]);
  drawMaze();
  if (nr===end[0] && nc===end[1]) {
    statusbox.innerHTML = "<i></i> DESTINATION REACHED!";
    showCongratulations();
  } else {
    statusbox.innerHTML = "<i></i> DRAWING PATH";
  }
}

document.addEventListener("keydown", event => {
  if (workspace.hidden) return;
  const active = document.activeElement;
  if (active && ["INPUT","SELECT","TEXTAREA","BUTTON"].includes(active.tagName)) return;
  const keyDirs = {ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1]};
  if (!keyDirs[event.key]) return;
  event.preventDefault();
  moveHead(...keyDirs[event.key]);
});

function drawMaze(explored=[], path=[]) {
  const exploredSet = new Set(explored.map(([r,c])=>`${r},${c}`));
  const pathSet = new Set(path.map(([r,c])=>`${r},${c}`));
  const trailSet = new Set(trail.map(([r,c])=>`${r},${c}`));
  mazearea.innerHTML = "";
  mazearea.style.gridTemplateColumns = `repeat(${cols}, auto)`;
  const frag = document.createDocumentFragment();
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const v = grid[r][c], key = `${r},${c}`;
    if (v==="#") cell.classList.add("wall");
    if (exploredSet.has(key)) cell.classList.add("explored");
    if (trailSet.has(key)) cell.classList.add("trail-cell");
    if (pathSet.has(key)) cell.classList.add("route");
    if (v==="S") cell.classList.add("start");
    if (v==="E") cell.classList.add("end");
    if (r===head[0] && c===head[1]) cell.classList.add("head");
    frag.appendChild(cell);
  }
  mazearea.appendChild(frag);
}

function search(algo) {
  const pending = [start], seen = new Set([start.join(",")]);
  let index = 0;
  const parent = new Map(), explored = [];
  while (algo==="bfs" ? index<pending.length : pending.length>0) {
    const cur = algo==="bfs" ? pending[index++] : pending.pop();
    const key = cur.join(",");
    explored.push(cur);
    if (cur[0]===end[0] && cur[1]===end[1]) break;
    for (const [dr,dc] of dirs) {
      const nr=cur[0]+dr, nc=cur[1]+dc, nextkey=`${nr},${nc}`;
      if (nr<0 || nr>=rows || nc<0 || nc>=cols || grid[nr][nc]==="#" || seen.has(nextkey)) continue;
      seen.add(nextkey); parent.set(nextkey,key); pending.push([nr,nc]);
    }
  }
  const endkey=end.join(",");
  if (!seen.has(endkey)) return {found:false,explored,path:[]};
  const path=[]; let key=endkey;
  while (key) {
    const [r,c]=key.split(",").map(Number);
    path.push([r,c]);
    if (key===start.join(",")) break;
    key=parent.get(key);
  }
  path.reverse();
  return {found:true,explored,path};
}

function solve(algo=algoinput.value) {
  const result = search(algo);
  drawMaze(result.explored,result.path);
  statusbox.innerHTML = result.found
    ? `<i></i> PATH FOUND`
    : "<i></i> NO PATH FOUND";
  if (!result.found) alert("No path found in this maze.");
  return result;
}

function showCongratulations() {
  if (document.getElementById("win-popup")) return;
  const popup = document.createElement("div");
  popup.id = "win-popup";
  popup.className = "win-popup";
  popup.innerHTML = `
    <div class="win-card">
      <div class="win-emoji">🎉</div>
      <h2>Congratulations!</h2>
      <p>You reached the destination!</p>
      <button id="play-again" class="btn btn-primary">Play again</button>
      <button id="close-win" class="btn btn-outline">Continue exploring</button>
    </div>`;
  document.body.appendChild(popup);
  document.getElementById("play-again").onclick = () => { closeCongratulations(); makeMaze(); };
  document.getElementById("close-win").onclick = closeCongratulations;
}
function closeCongratulations() {
  const popup = document.getElementById("win-popup");
  if (popup) popup.remove();
}

document.getElementById("generate").addEventListener("click", makeMaze);
document.getElementById("reset").addEventListener("click", () => {
  closeCongratulations();
  head = [...start];
  trail = [[...start]];
  lastResults = {};
  document.getElementById("comparison").classList.add("hidden");
  drawMaze();
  statusbox.innerHTML = "<i></i> READY";
});

document.getElementById("show-solution").addEventListener("click", () => {
  const section = document.getElementById("comparison");
  const button = document.getElementById("show-solution");
  const opening = section.classList.contains("hidden");
  if (opening) {
    const bfs = search("bfs");
    const dfs = search("dfs");
    document.getElementById("bfs-length").textContent = bfs.found ? `${bfs.path.length - 1} steps` : "No route";
    document.getElementById("bfs-explored").textContent = `Cells checked: ${bfs.explored.length}`;
    document.getElementById("dfs-length").textContent = dfs.found ? `${dfs.path.length - 1} steps` : "No route";
    document.getElementById("dfs-explored").textContent = `Cells checked: ${dfs.explored.length}`;

    const exploredMax = Math.max(bfs.explored.length, dfs.explored.length, 1);
    const bfsSteps = bfs.found ? bfs.path.length - 1 : 0;
    const dfsSteps = dfs.found ? dfs.path.length - 1 : 0;
    const pathMax = Math.max(bfsSteps, dfsSteps, 1);

    document.getElementById("bfs-explored-bar").style.width = `${bfs.explored.length / exploredMax * 100}%`;
    document.getElementById("dfs-explored-bar").style.width = `${dfs.explored.length / exploredMax * 100}%`;
    document.getElementById("bfs-explored-value").textContent = bfs.explored.length;
    document.getElementById("dfs-explored-value").textContent = dfs.explored.length;

    document.getElementById("bfs-length-bar").style.width = `${bfsSteps / pathMax * 100}%`;
    document.getElementById("dfs-length-bar").style.width = `${dfsSteps / pathMax * 100}%`;
    document.getElementById("bfs-length-value").textContent = bfs.found ? bfsSteps : "—";
    document.getElementById("dfs-length-value").textContent = dfs.found ? dfsSteps : "—";

    section.classList.remove("hidden");
    button.textContent = "Hide solution comparison";
    button.setAttribute("aria-expanded", "true");
  } else {
    section.classList.add("hidden");
    button.textContent = "Show solution & compare BFS vs DFS";
    button.setAttribute("aria-expanded", "false");
    drawMaze();
  }
});

document.getElementById("show-bfs").addEventListener("click", () => {
  const result = search("bfs");
  if (!result.found) return;
  drawMaze(result.explored, result.path);
  statusbox.innerHTML = "<i></i> SHORTEST ROUTE SHOWN";
});
document.getElementById("show-dfs").addEventListener("click", () => {
  const result = search("dfs");
  if (!result.found) return;
  drawMaze(result.explored, result.path);
  statusbox.innerHTML = "<i></i> DFS ROUTE SHOWN";
});
