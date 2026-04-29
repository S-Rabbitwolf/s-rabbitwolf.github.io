// Final Fantasy Tactics has a divisor number of 1638400 for its base calculations of stat growths. The calculation is as such:

// Stat = (Raw x M / 1638400) where Raw is the internal value of the character's statistics, and M is the job's multiplier. 

const DIVISOR = 1638400

// These are the core stats which are affected by growth constants (C). Centralizing them will keep loops consistent
const STAT_KEYS = ["hp", "mp", "speed", "pa", "ma"]

let fftData = null;

fetch("./arithmetician.json")
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        console.log("It's working! Loaded:", data);
    })
    .catch(function(err) {
        console.error("Didn't work. Didn't load:", err);
    });
    

// Loading the arithmetician json. Calculation centric

// Code to apply if the json is connecting. Testing 
// async function loadFFTData() {*
 //   const response = await fetch("./arithmetician.json");

//    if(!response.ok) {
//        throw new Error("Failed to connect to the json file. Check for typos.")
//    }

//    fftData = await response.json();

    // Automatically populate dropdown
//    populateJobDropdowns();

//    return fftData; //*