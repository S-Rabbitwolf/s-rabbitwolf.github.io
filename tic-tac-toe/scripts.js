// declare the board data for a game, using 3 arrays
// "-" indicates unmarked, "x" indicates an X mark, "o" indicates an O mark
let rowA = [ "x", "x", "o" ];
let rowB = [ "x", "x", "o" ];
let rowC = [ "-", "o", "x" ];




function checkGameboard(a, b, c) {
  

let board = [a, b, c];
  
   //checking rows
  for (let i = 0; i <3; i++) {
    if (board[i][0] !== "-" &&
        board[i][0] === board[i][1] &&
        board[i][1] === board[i][2]) {
        return board[i][0];
  }
  }

// columns
  for (let i = 0; i < 3; i++) {
    if (board[0][i] !== "-" &&
        board[0][i] === board[1][i] &&
        board[1][i] === board[2][i]) {
      return board[0][i]
    }
  }

  // diagonals
  
  if (board[0][1] !== "-" &&
     board[0][1] === board[1][1] &&
     board[1][1] === board[2][2]) {
    return board[0][0];
   }
  
  if (board[0][2] !== "-" &&
     board[0][2] === board[1][1] &&
     board[1][1] === board[2][0]) {
    return board[0][2];
  }
  
  return "d";
}




/* Commenting


// get a handle on the DOM element to be updated with the outcome
let gameOutputMsg = document.querySelector("#gameResult span");


// call your function checkGameboard() with the 3 rows
let winState = checkGameboard(rowA, rowB, rowC);

// test the returned value of the function
if (winState == "x") { 
  gameOutputMsg.innerHTML = "X wins";
  
} else if (winState == "o") {
  gameOutputMsg.innerHTML = "O wins";
  
} else if (winState == "d") {
  gameOutputMsg.innerHTML = "draw";
  
} else {
  gameOutputMsg.innerHTML = "unknown";
}