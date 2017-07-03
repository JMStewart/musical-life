export default class Board {
  constructor(rows, columns) {
    this.starveCount = 2;
    this.overpopulateCount = 3;
    this.reproduceCount = 3;
    this.board = [];
    this.activeCells = [];
    for (let r=0; r<rows; r++) {
      this.board[r] = [];
      for (let c=0; c<columns; c++) {
        this.board[r][c] = false;
      }
    }
  }

  getCell(r, c) {
    if (this.board[r]){
      return this.board[r][c];
    }
    return false;
  }

  calculateActiveCells() {
    this.activeCells = this.board.reduce((result, row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          result.push([r, c, cell]);
        }
      });
      return result;
    }, []);
    return this.activeCells;
  }

  getActiveCells() {
    // if (!this.activeCells) {
      this.calculateActiveCells();
    // }
    return this.activeCells;
  }

  tick() {
    // this.board = this.board.map((row, r) => {
    //   return row.map((cell, c) => {
    //     const neighbors = this.getNeighborCount(r, c);
    //     if (neighbors < this.starveCount) return false;
    //     if (neighbors > this.overpopulateCount) return false;
    //     if (neighbors === this.reproduceCount) return true;
    //     return cell;
    //   });
    // });
    const newBoard = [];
    for (let r = 0; r < this.board.length; r++) {
      newBoard[r] = [];
      for (let c = 0; c < this.board[r].length; c++) {
        const neighbors = this.getNeighborCount(r, c);
        if (neighbors < this.starveCount) {
          newBoard[r][c] = false;
        } else if (neighbors > this.overpopulateCount) {
          newBoard[r][c] = false;
        } else if (neighbors === this.reproduceCount) {
          newBoard[r][c] = this.board[r][c] + 1;
        } else {
          newBoard[r][c] = this.board[r][c];
        }
      }
    }
    this.board = newBoard;
  }

  getNeighborCount(r, c) {
    const startC = c <= 0 ? 0 : c-1;
    const top = this.board[r-1];
    const middle = this.board[r];
    const bottom = this.board[r+1];
    let neighbors = [middle[c-1], middle[c+1]];
    if (top) {
      neighbors = [...neighbors, ...top.slice(startC,c+2)];
    }
    if (bottom) {
      neighbors = [...neighbors, ...bottom.slice(startC,c+2)];
    }
    return neighbors.filter(n => n).length;
  }

  toggleCell(r, c) {
    this.board[r][c] = !this.board[r][c];
  }

  activateCell(r, c) {
    this.board[r][c] = 1;
  }

  deactivateCell(r, c) {
    this.board[r][c] = false;
  }

  clear() {
    this.board = this.board.map(row => {
      return row.map(cell => false);
    });
    this.activeCells = [];
  }

  randomize() {
    this.board = this.board.map(row => {
      return row.map(cell => Math.random() > 0.5 ? 1 : false);
    });
  }
}

