let audioPlayer = null;
let autoPlay = false;

// Global variables
let repeat = 3;
let silence = 5000; // milliseconds

// Populate Repeat dropdown
const repeatSelect = document.getElementById('repeatSelect');
for (let i = 1; i <= 10; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    repeatSelect.appendChild(option);
}
repeatSelect.value = repeat;
repeatSelect.addEventListener('change', () => {
    repeat = parseInt(repeatSelect.value);
    saveStateToLocal();
});

// Populate Silence dropdown
const silenceSelect = document.getElementById('silenceSelect');
const silenceOptions = document.createDocumentFragment();

// Add X multiplier options
['1X', '2X', '3X'].forEach(x => {
    const option = document.createElement('option');
    option.value = x;
    option.textContent = x;
    silenceOptions.appendChild(option);
});

// Add normal second options
for (let i = 1; i <= 60; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} sec`;
    silenceOptions.appendChild(option);
}


silenceSelect.appendChild(silenceOptions);

// Set initial silence value
silenceSelect.value = silence / 1000;

silenceSelect.addEventListener('change', () => {
    const value = silenceSelect.value;
    if (value.endsWith('X')) {
        silence = value; // Store as "1X", "2X", etc.
    } else {
        silence = parseInt(value) * 1000; // Store as milliseconds
    }
    saveStateToLocal();
});

const playBtn = document.getElementById('playAudioBtn');
const stopBtn = document.getElementById('stopAudioBtn');
const playOneBtn = document.getElementById('playOneAudioBtn');

playBtn.addEventListener('click', () => {
    if (!autoPlay) {
        autoPlay = true;
        initAudioPlayer();
    }
});

stopBtn.addEventListener('click', () => {
    autoPlay = false;
    stopAudio();
});

playOneBtn.addEventListener('click', () => {
    autoPlay = false;
    initAudioPlayer();
});

function initAudioPlayer() {
    stopAudio(); // Stop old audio

    if (!audioPlayer) {
        audioPlayer = new Audio();
    }

    loadCurrentVerse();

    stopBtn.classList.add('playing');

    let playCount = 0;

    audioPlayer.addEventListener('ended', async function handler() {
        playCount++;
        if (playCount < repeat) {
            // Repeat same verse after silence
            let delay = getSilenceDelay();
            setTimeout(() => {
                audioPlayer.currentTime = 0;
                audioPlayer.play();
            }, delay);
        } else if (autoPlay) {
            const isLastVerse = isAtLastVerse();
            if (!isLastVerse) {
                incrementVerse();
                setTimeout(() => {
                    loadCurrentVerse();
                    playCount = 0;
                    audioPlayer.play();
                }, getSilenceDelay());
            } else {
                autoPlay = false;
                stopBtn.classList.remove('playing');
            }
        } else {
            stopBtn.classList.remove('playing');
        }
    });
}

// Calculates silence delay based on selected option
function getSilenceDelay() {
    if (typeof silence === 'string' && silence.endsWith('X')) {
        const multiplier = parseInt(silence[0]);
        if (audioPlayer && !isNaN(audioPlayer.duration)) {
            return Math.round(audioPlayer.duration * 1000 * multiplier);
        }
        return 1000; // fallback if duration not ready
    } else {
        return silence;
    }
}

function loadCurrentVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const reciterSelect = document.getElementById('reciter'); // Get the reciter dropdown
    const chapter = chapterSelect.value;
    const verse = verseSelect.value;
    const reciter = reciterSelect.value; // Get the selected reciter
    const chapter_padded = padNumber(chapter);
    const verse_padded = padNumber(verse);
    const audioPath = `data/sounds/${reciter}/${chapter_padded}${verse_padded}.mp3`;

    if (audioPlayer) {
        showLoadingStatus(`Loading ${chapter}:${verse}...`);
        audioPlayer.src = audioPath;
        audioPlayer.load();
        audioPlayer.addEventListener('canplaythrough', () => {
            hideLoadingStatus();
            if (autoPlay || !autoPlay) { // both for single play and auto
                audioPlayer.play();
            }
        }, { once: true });
        audioPlayer.addEventListener('error', () => {
            console.error(`Failed to load: ${audioPath}`);
            hideLoadingStatus();
            stopBtn.classList.remove('playing');
        }, { once: true });
    }
}

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute('src');
        audioPlayer.load();
        audioPlayer = null;
    }
    stopBtn.classList.remove('playing');
}

function isAtLastVerse() {
    const verseSelect = document.getElementById('verseSelect');
    return verseSelect.selectedIndex === verseSelect.options.length - 1;
}

function incrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    if (verseSelect.selectedIndex < verseSelect.options.length - 1) {
        verseSelect.selectedIndex++;
    }
}

// Helper: Pad numbers to 3 digits
function padNumber(num) {
    return num.toString().padStart(3, '0');
}

// Dummy functions
function showLoadingStatus(msg) {
    console.log(msg);
}
function hideLoadingStatus() {
    console.log("Loaded");
}
function saveStateToLocal() {
    // Save repeat/silence values if needed
}
