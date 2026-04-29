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

function populateJobDropdowns() {
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

 // As the DOM will be adjusted based on the JSon's data, automatically applying proper spacing and capitalization to prevent manual class/entity input to the DOM is necessary. 
 // For example, this will convert the entry of "timeMage" into "Time Mage".

 function formatJobName(jobKey) {
    return jobKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, function(char) {
        return char.toUpperCase();
 });
}

// For HP and MP, the assigned integer for a character upon creation is randomized with a min/max value. This will refer to the minimum and maximum values in the hp and mp fields of a given job.
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializeCharacter(sex) {
    if (sex === "male") {
        return {
            sex: "male",
            level: 1,
            rawStats: {
                hp: randomInt(491520, 524287),
                mp: randomInt(229376, 245759),
                speed: 98304,
                pa: 81920,
                ma: 65536
            }
        }
    };

    if (sex ==="female") {
        return {
            sex: "female",
            level: 1,
            rawStats: {
                hp: randomInt(458752, 491519),
                mp: randomInt(245760, 262143),
                speed: 98304,
                pa: 65536,
                ma: 81920
            }
        };
    }
}

// creates clone of raw stats to prevent accidental mutation or overflows

function cloneStats(stats) {
    return {
        hp: stats.hp,
        mp: stats.mp,
        speed: stats.speed,
        pa: stats.pa,
        ma: stats.ma
    };
}

// Primary calculation engine past this point

function calculateFFTStats(input) {

    if (!fftData) {
        throw new Error("Dataset not loaded just yet, please wait a sec.");
    }

    //data shortcut to reference jobs
    const jobs = fftData.jobs;

    let currentLevel = input.startingLevel;

    //Clone starting stats so original is saved
    const rawStats = cloneStats(input.startingRawStats);

    // Optional for debugging or interior visualization
    const breakdown = [];

    // Segmenting for level range representation
    for (const segment of input.levelPath) {

        const job = jobs[segment.job];

        for (let level = segment.fromLevel; level < segment.toLevel; level++) {

            for (const stat of STAT_KEYS) {
                
                const constant = job.constants[stat];

                /* The formula for FFT growth on level up is as follows:

                bonus = floor(currentRawStat / (C + level))

                The lower C (constant) is, the better the growth
                As level increases, growth slows implicitly.
                */

                // Stats do not increase until the next whole integer is reached.
                const bonus = Math.floor(rawStats[stat] / (constant + level));

                rawStats[stat] += bonus;

            }

            currentLevel = level + 1;

            if (input.includeLevelBreakdown) {
                breakdown.push({
                    level: currentLevel,
                    job: segment.job,
                    rawStats: cloneStats(rawStats)
                });
            }
        }
    }

    const displayJob = jobs[input.displayJob];

    // The level calculation, starting from 1 and incrementing with each processed segment. The raw stats are not what is displayed in-game, but the internal calculation until DisplayStats.
    return {
        startingLevel: input.startingLevel,
        endingLevel: currentLevel,
        displayJob: input.displayJob,
        finalRawStats: rawStats,
        finalDisplayStats: calculateDisplayStats(rawStats, displayJob),
        breakdown: input.includeLevelBreakdown ? breakdown : undefined
    };
}


    // The raw stats are then converted into displayed stats with the job's inherent modifier as discussed previously.

    function calculateDisplayStats(rawStats, job) {

        const caps = {
            hp: 999,
            mp: 999,
            speed: 99,
            pa: 99,
            ma: 99
        };

        const output = {};
        
        for (const stat of STAT_KEYS) {

            const multiplier = job.multipliers[stat];

            const multiplied = rawStats[stat] * multiplier;

            let value = Math.floor(multiplied / DIVISOR);

            if (value < 1) value = 1;
            if (value > caps[stat]) value = caps[stat];

            output[stat] = value;
        }

        return output;
    }

    //loadFFTData();

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

// Test input.

let testCharacter = null;

document.addEventListener("DOMContentLoaded", function() {
    loadFFTData().then(function() {
        testCharacter = initializeCharacter("male");

        updatePreview();

        document.getElementById("calculate").addEventListener("click", function() {
            updatePreview();
        });

        document.getElementById("jobSelect").addEventListener("change", function() {
            updatePreview();
        });

        document.getElementById("targetLevel").addEventListener("input", function() {
            updatePreview();
        });
    });
});

function updatePreview() {
    const selectedJob = document.getElementById("jobSelect").value;
    const targetLevel = Number(document.getElementById("targetLevel").value);

    if (!selectedJob || !targetLevel || targetLevel < 2) {
        return;
    }

    const result = calculateFFTStats({
        startingLevel: testCharacter.level,
        startingRawStats: testCharacter.rawStats,
        displayJob: selectedJob,
        includeLevelBreakdown: false,
        levelPath: [
            {
                job: selectedJob,
                fromLevel: 1,
                toLevel: targetLevel
            }
        ]
    });

    document.getElementById("previewOutput").textContent =
        document.getElementById("previewOutput").textContent =
            "Level " + result.endingLevel + " " + formatJobName(selectedJob) + "\n\n" +
            "HP: " + result.finalDisplayStats.hp + "\n" +
            "MP: " + result.finalDisplayStats.mp + "\n" +
            "Speed: " + result.finalDisplayStats.speed + "\n" +
            "PA: " + result.finalDisplayStats.pa + "\n" +
            "MA: " + result.finalDisplayStats.ma;
}