// Final Fantasy Tactics has a divisor number of 1638400 for its base calculations of stat growths. The calculation is as such:

// Stat = (Raw x M / 1638400) where Raw is the internal value of the character's statistics, and M is the job's multiplier. 

const DIVISOR = 1638400

// These are the core stats which are affected by growth constants (C). Centralizing them will keep loops consistent
const STAT_KEYS = ["hp", "mp", "speed", "pa", "ma"]

let fftData = null;
let jobDetails = null;



// Loading the arithmetician json. Calculation centric
async function loadFFTData() {
    const response = await fetch("./arithmetician.json");
    const detailsResponse = await fetch("./jobDetails.json");

    if (!response.ok) {
        throw new Error("Failed to connect to the json file. Check for typos.")
    }

    if (!detailsResponse.ok) {
        throw new Error("Failed to load jobDetails.json. Check for typos and whatnot");
    }

    fftData = await response.json();
    jobDetails = await detailsResponse.json();

    // Automatically populate dropdown when data is loaded

    populateJobDropdowns();

    return fftData;
}

// Fills dropdowns with the job names based on arithmetician.json so UI doesn't confuse anybody via names

function populateJobDropdowns() {
    const dropdowns = document.querySelectorAll(".job-select");
    // Allows for multiple jobs to contribute to the same dropdown menu.
    for (const dropdown of dropdowns) {
        populateSingleJobDropdown(dropdown);

    }
}

// As the DOM will be adjusted based on the JSon's data, automatically applying proper spacing and capitalization to prevent manual class/entity input to the DOM is necessary. 
// For example, this will convert the entry of "timeMage" into "Time Mage".

function formatJobName(jobKey) {
    return jobKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, function (char) {
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

    if (sex === "female") {
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

document.addEventListener("DOMContentLoaded", function () {
    loadFFTData().then(function () {
        testCharacter = initializeCharacter("male");

        document.getElementById("addSegment").addEventListener("click", function () {
            addSegmentRow();
        });

        document.getElementById("calculate").addEventListener("click", function () {
            updatePreview();
        });

        document.getElementById("addComparisonSegment").addEventListener("click", function () {
            addComparisonSegmentRow();
        });

        document.getElementById("comparisonMode").addEventListener("change", function () {
            updateComparisonUI();
        });
        document.getElementById("resetCalculator").addEventListener("click", function () {
            resetCalculator();
        });

        document.getElementById("jobInfoSelect").addEventListener("change", function () {
            updateJobInfoPanel();
        });

        updateJobInfoPanel();

        updateComparisonUI();
    });
});





// This function will add additional job segments for a level range, attached to a button
function addSegmentRow() {
    const container = document.getElementById("segmentContainer");
    const existingSegments = document.querySelectorAll(".level-segment")

    let startingLevel = 1;

    if (existingSegments.length > 0) {
        const lastSegment = existingSegments[existingSegments.length - 1];
        const lastToLevel = Number(lastSegment.querySelector(".to-level").value);

        if (lastToLevel) {
            startingLevel = lastToLevel;
        }
    }

    const segment = document.createElement("div");
    segment.className = "level-segment";

    segment.innerHTML =
        '<label>Select Job</label>' +
        '<select class="job-select segment-job"></select>' +

        '<label>From Level</label>' +
        '<input class="from-level" type="number" min="1" max="99" value="' + startingLevel + '">' +

        '<label>To Level</label>' +
        '<input class="to-level" type="number" min="' + (startingLevel + 1) + '" max="99" value="' + (startingLevel + 1) + '">';

    container.appendChild(segment);

    populateSingleJobDropdown(segment.querySelector(".segment-job"));
}

function addComparisonSegmentRow() {
    const container = document.getElementById("comparisonSegmentContainer");
    const existingSegments = document.querySelectorAll(".comparison-level-segment");

    const segment = document.createElement("div");
    segment.className = "comparison-level-segment";

    let startingLevel = 1;

    if (existingSegments.length > 0) {
        const lastSegment = existingSegments[existingSegments.length - 1];
        const lastToLevel = Number(lastSegment.querySelector(".comparison-to-level").value);

        if (lastToLevel) {
            startingLevel = lastToLevel;
        }
    }

    segment.innerHTML =
        '<label>Select Job</label>' +
        '<select class="job-select comparison-segment-job"></select>' +

        '<label>From Level</label>' +
        '<input class="comparison-from-level" type="number" min="1" max="99" value="' + startingLevel + '">' +

        '<label>To Level</label>' +
        '<input class="comparison-to-level" type="number" min="' + (startingLevel + 1) + '" max="99" value="' + (startingLevel + 1) + '">';

    container.appendChild(segment);

    populateSingleJobDropdown(segment.querySelector(".comparison-segment-job"));
}

function buildLevelPathFromSegments() {
    const segmentElements = document.querySelectorAll(".level-segment");
    const levelPath = [];

    for (const segmentElement of segmentElements) {
        const job = segmentElement.querySelector(".segment-job").value;
        const fromLevel = Number(segmentElement.querySelector(".from-level").value);
        const toLevel = Number(segmentElement.querySelector(".to-level").value);

        if (!job || !fromLevel || !toLevel) {
            continue;
        }

        if (toLevel <= fromLevel) {
            alert("To Level must be higher than From Level.");
            return [];
        }
        // adds to end of array
        levelPath.push({
            job: job,
            fromLevel: fromLevel,
            toLevel: toLevel
        });
    }

    return levelPath;
}

function populateSingleJobDropdown(dropdown) {
    dropdown.innerHTML = "";

    for (const jobKey of Object.keys(fftData.jobs)) {
        const option = document.createElement("option");

        option.value = jobKey;
        option.textContent = formatJobName(jobKey);

        dropdown.appendChild(option);
    }
}

function updateJobInfoPanel() {
    const selectedJob = document.getElementById("jobInfoSelect").value;
    const job = fftData.jobs[selectedJob];
    const details = jobDetails[selectedJob];

    document.getElementById("jobInfoContent").innerHTML =
        '<h3>' + formatJobName(selectedJob) + '</h3>' +

        '<p>' + details.description + '</p>' +
        '<h4>Equipment</h4>' +
        '<p>Weapons: ' + details.weapons.join(", ") + '</p>' +
        '<p>Armor: ' + details.armor.join(", ") + '</p>' +

        '<details>' +
    '<summary>Show Growth Constants / Multipliers</summary>' +

        '<h4>Growth Constants</h4>' +
        '<p>HP: ' + job.constants.hp + '</p>' +
        '<p>MP: ' + job.constants.mp + '</p>' +
        '<p>Speed: ' + job.constants.speed + '</p>' +
        '<p>PA: ' + job.constants.pa + '</p>' +
        '<p>MA: ' + job.constants.ma + '</p>' +

        '<h4>Multipliers</h4>' +
        '<p>HP: ' + job.multipliers.hp + '</p>' +
        '<p>MP: ' + job.multipliers.mp + '</p>' +
        '<p>Speed: ' + job.multipliers.speed + '</p>' +
        '<p>PA: ' + job.multipliers.pa + '</p>' +
        '<p>MA: ' + job.multipliers.ma + '</p>' +
    '</details>';
}


// For comparing stats in numerical fashion. 
function compareStats(customStats, baselineStats) {
    return {
        hp: customStats.hp - baselineStats.hp,
        mp: customStats.mp - baselineStats.mp,
        speed: customStats.speed - baselineStats.speed,
        pa: customStats.pa - baselineStats.pa,
        ma: customStats.ma - baselineStats.ma
    };
}

function formatDifference(value) {
    if (value > 0) return "+" + value;
    if (value < 0) return value;
    return "+/-0";
}

function updatePreview() {

    //Combines each segment into the full path sequentially.
    const levelPath = buildLevelPathFromSegments();

    if (levelPath.length === 0) {
        document.getElementById("previewOutput").textContent = "No level path selected pal";
        return;
    }


    // Ensures that the multiplier only applies to the final job selected. Multipliers do not affect C growths.
    const finalSegment = levelPath[levelPath.length - 1];
    const selectedDisplayJob = finalSegment.job;


    // CalculateFFTStats function for the test character.
    const customResult = calculateFFTStats({
        startingLevel: testCharacter.level,
        startingRawStats: testCharacter.rawStats,
        displayJob: selectedDisplayJob,
        includeLevelBreakdown: false,
        levelPath: levelPath
    });

    const showBreakdown = document.getElementById("showBreakdown").checked;


    // Displaying only final in-game values based on the calculations
    document.getElementById("previewOutput").textContent =
        "Level " + customResult.endingLevel + " " + formatJobName(selectedDisplayJob) + "\n\n" +
        "HP: " + customResult.finalDisplayStats.hp + "\n" +
        "MP: " + customResult.finalDisplayStats.mp + "\n" +
        "Speed: " + customResult.finalDisplayStats.speed + "\n" +
        "PA: " + customResult.finalDisplayStats.pa + "\n" +
        "MA: " + customResult.finalDisplayStats.ma;
    // If the Breakdown option is selected, it'll show the actual raw stats behind the scenes used for calculation.
    if (showBreakdown) {
        document.getElementById("previewOutput").textContent +=
            "\n\nRaw Internal Stats:\n" +
            "Raw HP: " + customResult.finalRawStats.hp + "\n" +
            "Raw MP: " + customResult.finalRawStats.mp + "\n" +
            "Raw Speed: " + customResult.finalRawStats.speed + "\n" +
            "Raw PA: " + customResult.finalRawStats.pa + "\n" +
            "Raw MA: " + customResult.finalRawStats.ma;
    }

    const comparisonMode = document.getElementById("comparisonMode").value;

    if (comparisonMode === "none") {
        document.getElementById("comparisonOutput").textContent = "";
        return;
    }

    if (comparisonMode === "custom") {
        const comparisonPath = buildComparisonPathFromSegments();

        if (comparisonPath.length === 0) {
            document.getElementById("comparisonOutput").textContent =
                "No custom comparison for jobs selected.";
            return;
        }

        const comparisonFinalSegment = comparisonPath[comparisonPath.length - 1];

        const comparisonResult = calculateFFTStats({
            startingLevel: testCharacter.level,
            startingRawStats: testCharacter.rawStats,
            displayJob: comparisonFinalSegment.job,
            includeLevelBreakdown: false,
            levelPath: comparisonPath
        });

        const statDifference = compareStats(
            customResult.finalDisplayStats,
            comparisonResult.finalDisplayStats
        );

        document.getElementById("comparisonOutput").textContent =
            "Compared to custom path ending in " + formatJobName(comparisonFinalSegment.job) + "\n\n" +

            "Comparison Stats:\n" +
            "HP: " + comparisonResult.finalDisplayStats.hp + "\n" +
            "MP: " + comparisonResult.finalDisplayStats.mp + "\n" +
            "Speed: " + comparisonResult.finalDisplayStats.speed + "\n" +
            "PA: " + comparisonResult.finalDisplayStats.pa + "\n" +
            "MA: " + comparisonResult.finalDisplayStats.ma + "\n\n" +

            "Difference:\n" +
            "HP: " + formatDifference(statDifference.hp) + "\n" +
            "MP: " + formatDifference(statDifference.mp) + "\n" +
            "Speed: " + formatDifference(statDifference.speed) + "\n" +
            "PA: " + formatDifference(statDifference.pa) + "\n" +
            "MA: " + formatDifference(statDifference.ma);

        return;
    }


    //build BASELINE path from the final job.
    const baselinePath = buildBaselinePathFromFinalJob(levelPath);


    if (baselinePath === null) {
        document.getElementById("comparisonOutput").textContent =
            "Nothin' to compare."
        return;
    }
    const baselineResult = calculateFFTStats({
        startingLevel: testCharacter.level,
        startingRawStats: testCharacter.rawStats,
        displayJob: selectedDisplayJob,
        includeLevelBreakdown: false,
        levelPath: baselinePath
    });

    const statDifference = compareStats(
        customResult.finalDisplayStats,
        baselineResult.finalDisplayStats
    );




    // for displaying comparison between base path and custom path

    const baselineStartLevel = baselinePath[baselinePath.length - 1].fromLevel;
    const baselineEndLevel = baselinePath[baselinePath.length - 1].toLevel;

    document.getElementById("comparisonOutput").textContent =
        "Compared to staying in " + formatJobName(selectedDisplayJob) +
        " from level " + baselineStartLevel +
        " to level " + baselineEndLevel + "\n\n" +

        "Baseline Stats:\n" +
        "HP: " + baselineResult.finalDisplayStats.hp + "\n" +
        "MP: " + baselineResult.finalDisplayStats.mp + "\n" +
        "Speed: " + baselineResult.finalDisplayStats.speed + "\n" +
        "PA: " + baselineResult.finalDisplayStats.pa + "\n" +
        "MA: " + baselineResult.finalDisplayStats.ma + "\n\n" +

        "Difference:\n" +
        "HP: " + formatDifference(statDifference.hp) + "\n" +
        "MP: " + formatDifference(statDifference.mp) + "\n" +
        "Speed: " + formatDifference(statDifference.speed) + "\n" +
        "PA: " + formatDifference(statDifference.pa) + "\n" +
        "MA: " + formatDifference(statDifference.ma);
}

// Base level comparison scripting to enable mode selects. Thank god for modularity
function buildComparisonPathFromSegments() {
    const segmentElements = document.querySelectorAll(".comparison-level-segment");
    const levelPath = [];

    for (const segmentElement of segmentElements) {
        const job = segmentElement.querySelector(".comparison-segment-job").value;
        const fromLevel = Number(segmentElement.querySelector(".comparison-from-level").value);
        const toLevel = Number(segmentElement.querySelector(".comparison-to-level").value);

        if (!job || !fromLevel || !toLevel) {
            continue;
        }

        if (toLevel <= fromLevel) {
            alert("Comparison To Level must be higher than From Level.");
            return [];
        }

        levelPath.push({
            job: job,
            fromLevel: fromLevel,
            toLevel: toLevel
        });
    }

    return levelPath;
}

// Baseline comparison. It compares stats on the final job if that individual had previously had that job before.
function buildBaselinePathFromFinalJob(levelPath) {
    const finalSegment = levelPath[levelPath.length - 1];
    const finalJob = finalSegment.job;
    const endingLevel = finalSegment.toLevel;

    let appearedEarlier = false;

    for (let i = 0; i < levelPath.length - 1; i++) {
        if (levelPath[i].job === finalJob) {
            appearedEarlier = true;
            break;
        }
    }

    if (!appearedEarlier) {
        return null;
    }

    let firstFinalJobIndex = -1;

    for (let i = 0; i < levelPath.length; i++) {
        if (levelPath[i].job === finalJob) {
            firstFinalJobIndex = i;
            break;
        }
    }

    if (firstFinalJobIndex === -1) {
        throw new Error("Final job was not found in level path, but you'll probably never see this lol. If you do something has gone horribly wrong");
    }

    const baselinePath = [];


    // Keep all segments before the first time the final job appears. This preserves the character's path before committing to that job.

    for (let i = 0; i < firstFinalJobIndex; i++) {
        baselinePath.push({
            job: levelPath[i].job,
            fromLevel: levelPath[i].fromLevel,
            toLevel: levelPath[i].toLevel
        });
    }

    // From the first time the final job appears, compared against staying in that final job until the end.
    baselinePath.push({
        job: finalJob,
        fromLevel: levelPath[firstFinalJobIndex].fromLevel,
        toLevel: endingLevel
    });

    return baselinePath;
}

function updateComparisonUI() {
    const mode = document.getElementById("comparisonMode").value;

    const container = document.getElementById("comparisonSegmentContainer");
    const button = document.getElementById("addComparisonSegment");

    if (mode === "custom") {
        container.style.display = "block";
        button.style.display = "inline-block";
    } else {
        container.style.display = "none";
        button.style.display = "none";
    }
}

function resetCalculator() {

    // Clears segments without needing to refresh the page and whatnot
    const container = document.getElementById("segmentContainer");
    container.innerHTML = "";

    addSegmentRow()

    const comparisonContainer = document.getElementById("comparisonSegmentContainer");
    comparisonContainer.innerHTML = "";

    document.getElementById("previewOutput").textContent = "";

    document.getElementById("comparisonOutput").textContent = "";

    document.getElementById("comparisonMode").value = "none";
    updateComparisonUI();
}