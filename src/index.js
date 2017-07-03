import style from './style.css';
import Board from './board.js';

import Wad from 'web-audio-daw';

const tone = new Wad({
  source: 'sine',
  env: {
    attack: 0.1,
    decay: 0,
    sustain: 1,
    hold: 0,
    release: 0.1
  },
  // delay: {
  //   delayTime: 0.5,
  //   feedback: 0.1,
  //   wet: 0.1
  // }
});

window.tone = tone;

const rawNotes = ['C', 'D', 'F', 'G', 'A'];
// ['C4','D4','F4','G4','A4','C5','D5','F5','G5','A5','C6','D6','F6','G6','A6','C7']
const notes = [];
let playList = {};

const unitSize = 40;
const rows = 16;
const columns = 16;
const WHITE = '#FFF';
const BLACK = '#000';
const RED = '#cc3a2f';
const BLUE = '#3f51b5';
const GREEN = '#4fb153';

let interval;
let running = false;

const gameBoard = document.getElementById('gameBoard');
gameBoard.width = columns*unitSize+1;
gameBoard.height = rows*unitSize+1;
const ctx = gameBoard.getContext('2d');
// ctx.translate(0.5, 0.5);


let board = initBoard(rows, columns);
setupListener(gameBoard);
setupButtons();
drawGame(board);
runSimulation();


function initBoard(rows, columns) {
  const newBoard = new Board(rows, columns);
  return newBoard;
}

function drawGrid() {
  ctx.strokeStyle = BLACK;
  for (let r=0; r<=rows; r++) {
    ctx.moveTo(0, r*unitSize);
    ctx.lineTo(columns*unitSize, r*unitSize);
  }
  for (let c=0; c<=columns; c++) {
    ctx.moveTo(c*unitSize, 0);
    ctx.lineTo(c*unitSize, rows*unitSize);
  }
  ctx.stroke();
}

function drawRect([y, x, n]) {
  ctx.fillStyle = getColor(n);
  ctx.fillRect(x*unitSize, y*unitSize, unitSize, unitSize);
  // const note = rawNotes[Math.floor(Math.random() * rawNotes.length)];
  const note = rawNotes[(rows - y) % rawNotes.length];
  const octave = Math.floor((rows - y) / rawNotes.length) + 4;
  if (!playList[x]) {
    playList[x] = [];
  }
  playList[x].push({
    note: note + octave,
    coords: [y, x, n]
  });
}

function highlightRect([y, x, n]) {
  ctx.fillStyle = BLACK;
  ctx.fillRect(x*unitSize, y*unitSize, unitSize, unitSize);
  setTimeout(() => {
    ctx.fillStyle = getColor(n);
    ctx.fillRect(x*unitSize, y*unitSize, unitSize, unitSize);
  }, 100);
}

function drawGame(board) {
  playList = {};
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, columns*unitSize, rows*unitSize);
  // drawGrid();
  const activeCells = board.getActiveCells()
  activeCells.map(drawRect);
  if (activeCells.length === 0) {
    pauseSimulation();
  }
}

function playNotes(counter) {
  if (playList[counter]) {
    playList[counter].map(rect => {
      highlightRect(rect.coords);
      tone.play({
        pitch: rect.note
      });
    });
  }
}

function setupListener(el) {
  let currentCell;
  let running = false;
  el.addEventListener('mousedown', (event) => {
    // running = !!interval;
    // if (running) {
    //   console.log('Drawing new cells');
    //   pauseSimulation();
    // }
    currentCell = getCell(el, event);
    board.toggleCell(...currentCell);
    drawGame(board);
    if (board.getCell(...currentCell)) {
      el.addEventListener('mousemove', mouseActivate);
    } else {
      el.addEventListener('mousemove', mouseDeactivate);
    }
  });
  el.addEventListener('mouseup', removeListeners);
  el.addEventListener('mouseout', removeListeners);

  function removeListeners() {
    // if (running) {
    //   runSimulation();
    // }
    el.removeEventListener('mousemove', mouseActivate);
    el.removeEventListener('mousemove', mouseDeactivate);
  }

  function mouseActivate(event) {
    const cell = getCell(el, event);
    if (cell[0] !== currentCell[0] || cell[1] !== currentCell[1]) {
      currentCell = cell;
      board.activateCell(...cell);
      drawGame(board);
    }
  }

  function mouseDeactivate(event) {
    const cell = getCell(el, event);
    if (cell[0] !== currentCell[0] || cell[1] !== currentCell[1]) {
      currentCell = cell;
      board.deactivateCell(...cell);
      drawGame(board);
    }
  }
}


function getCell(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return [Math.floor(y/unitSize), Math.floor(x/unitSize)];
}

function toggleSimulation() {
  if (running) {
    pauseSimulation();
  } else {
    // runSimulation();
    running = true;
    document.getElementById('play').innerHTML = 'Pause';
  }
}

function runSimulation() {
  running = true;
  let counter = 0;
  function animate() {
    // console.timeEnd('Frame');
    // console.time('Frame');
    setTimeout(() => {
      if (interval) {
        interval = requestAnimationFrame(animate);
      }
    }, 100);
    if (counter % columns === 0){
      counter = 0;
      if (running) {
        board.tick();
        drawGame(board);
      }
    }
    playNotes(counter++);
  }
  interval = requestAnimationFrame(animate);
  // document.getElementById('play').innerHTML = 'Pause';
}

function pauseSimulation() {
  document.getElementById('play').innerHTML = 'Play';
  // cancelAnimationFrame(interval);
  // interval = null;
  running = false;
}

function clearBoard() {
  board.clear();
  drawGame(board);
}

function randomizeBoard() {
  board.randomize();
  drawGame(board);
}

function setupButtons() {
  document.getElementById('play').addEventListener('click', toggleSimulation);
  document.getElementById('clear').addEventListener('click', clearBoard);
  document.getElementById('randomize').addEventListener('click', randomizeBoard);
}

function getColor(n) {
  if (n === 1) {
    return RED;
  } else if (n === 2) {
    return GREEN;
  } else {
    return BLUE;
  }
}