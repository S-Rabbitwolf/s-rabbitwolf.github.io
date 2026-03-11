// declare the board data for a game, using 3 arrays
// "-" indicates unmarked, "x" indicates an X mark, "o" indicates an O mark
let rowA = [ "-", "-", "-" ];
let rowB = [ "-", "-", "-" ];
let rowC = [ "-", "-", "-" ];

function spaceMatch(spaceA, spaceB, spaceC) {

}

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
  
  if (board[0][0] !== "-" &&
     board[0][0] === board[1][1] &&
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

//The initial value for the 'player' essentially just starting off as X. It is changed to O upon clic by the allSpaces click Event Listener string, which changes
//the next alloted letter in sequence

let currentPlayer ="X";

//Waits for page to load before the game can begin

document.addEventListener("DOMContentLoaded", function() {

    let allSpaces = document.querySelectorAll(".space");

    for (let x = 0; x < allSpaces.length; x++) {
      allSpaces[x].addEventListener("click", function(){
      if (this.innerHTML === "") {
        this.innerHTML = currentPlayer;

        if (x < 3) {
          rowA[x] = currentPlayer;
        } else if (x < 6) {
          rowB[x - 3] = currentPlayer;
        } else {
          rowC[x - 6] = currentPlayer;
        }

        let winner = checkGameboard(rowA, rowB, rowC);

        //This will check for a draw state

        let drawCheck = false;

        for (let i = 0; i < 3; i++) {
          if (rowA[i] === "-" || rowB[i] === "-" || rowC[i] === "-") {
            drawCheck = true;
          }
        }

        

        //For winning the game if X or O fills the appropriate rows. Will likely change to scrolling text and a little bit of funny confetti instead of an alert.

        if (winner === "X" || winner === "O") {
          alert(winner + " wins");
        } else if (drawCheck) {
          alert("It's a draw!!");


        //Essentially, if the current player is X, it will become O upon clicking since it is tied to the click listener.
        } else {
        if (currentPlayer === "X") {
          currentPlayer = "O";
        } else {
          currentPlayer = "X";
        }
      };
    }
    });
  }
});
    
console.log(checkGameboard(rowA, rowB, rowC));

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
*/