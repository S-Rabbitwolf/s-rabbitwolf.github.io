// to enable all elements with the class of card. This way I don't have to make 24938732 elements for each individual one lol
const cards = document.querySelectorAll(".card");

let winsound = document.querySelector("#winsound");
let winneroverlay = document.querySelector("#winneroverlay");
let winmess = document.querySelector("#WWCD");
let gameRevert = document.querySelector("#Reset");

gameRevert.addEventListener("click", gameReset);

let firstCard = null;
let secondCard = null;
let boardLock = false;

// Each card element has this attached to it. 'cards' is referring to the .card class in CSS, so despite having different datasets in html, they'll all have this individually on a per-use basis.//
cards.forEach(function(card) {
    card.addEventListener("click", flipCard);
});

function flipCard() {
    if (boardLock) return;
    if (this.classList.contains("matched")) return;
    if (this === firstCard) return;

    this.classList.add("flipped");

    if(firstCard === null) {
        firstCard = this;
    } else {
        secondCard = this;
        checkMatch();
    }
}

// These functions are checking for the matching criteria. dataset.match will look for the data-match element in the HTML to determine if it's valid//

function checkMatch() {
    if (firstCard.dataset.match === secondCard.dataset.match) {
        keepCardsFlipped();
    } else {
        flipCardsBack();
    }
}

function keepCardsFlipped() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    WinnerCheck();

    TurnAgain();
}

function flipCardsBack() {
    boardLock = true;

    setTimeout(function() {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        TurnAgain();
    }, 1000);
}

function TurnAgain() {
    firstCard = null;
    secondCard = null;
    boardLock = false;
}

// Enforcing the code to essentially say 'whenever everything has the matched class, you win the game. Go you! :)//
function WinnerCheck() {
    let matchedCards = document.querySelectorAll(".card.matched");

    if (matchedCards.length === cards.length) {
        winneroverlay.style.display = "block";
    }
}

function gameReset() {
    cards.forEach(function(card) {
        card.classList.remove("flipped");
        card.classList.remove("matched");
    });

    winneroverlay.style.display = "none";
    TurnAgain();
}