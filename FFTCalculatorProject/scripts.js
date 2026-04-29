// Final Fantasy Tactics has a divisor number of 1638400 for its base calculations of stat growths. The calculation is as such:

// Stat = (Raw x M / 1638400) where Raw is the internal value of the character's statistics, and M is the job's multiplier. 

const DIVISOR = 1638400

// These are the core stats which are affected by growth constants (C). Centralizing them will keep loops consistent
const STAT_KEYS = ["hp", "mp", "speed", "pa", "ma"]

let fftData = null;




// Loading the arithmetician json. Calculation centric
async function loadFFTData() {
    const response = await fetch("./arithmetician.json");

    if (!response.ok) {
        throw new Error("Failed to connect to the json file. Check for typos.")
    }

    fftData = await response.json();

// Automatically populate dropdown when data is loaded
    
    populateJobDropdowns();

    return fftData;
}

// Fills dropdowns with the job names based on arithmetician.json so UI doesn't confuse anybody via names

function populateJobDroopdowns() {
    const dropdowns = document.querySelectorAll(".job-select");

    for (const dropdown of dropdowns) {
        dropdown.innerHTML = "";

        for (const jobKey of Object.keys(fftData.jobs)) {
            const option = document.createElement("option");
            option.value = jobKey;
            option.textContent = formatJobName(jobKey);
            dropdown.appendChild(option);
        }
    }
}

//testing connectivity, ignore
// fetch("./arithmetician.json")
//    .then(function(res) {
//        return res.json();
//    })
//    .then(function(data) {
//        console.log("It's working! Loaded:", data);
//    })
//   .catch(function(err) {
//        console.error("Didn't work. Didn't load:", err);
//    });