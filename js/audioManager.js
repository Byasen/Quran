let audioPlayer = null;
let autoPlay = false;

// Global variables
let repeat = 1;
let silence = 0; // milliseconds
let reciter = 'abdullah_basfar';
let playCount = 0; // keep globally

const reciterSelect = document.getElementById('reciter');
reciterSelect.addEventListener('change', () => {
    reciter = reciterSelect.value;
    saveStateToLocal();
});

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

// Add normal second options
for (let i = 0; i <= 60; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} sec`;
    silenceOptions.appendChild(option);
}

// Add X multiplier options
['1X', '2X', '3X'].forEach(x => {
    const option = document.createElement('option');
    option.value = x;
    option.textContent = x;
    silenceOptions.appendChild(option);
});

silenceSelect.appendChild(silenceOptions);

// Set initial silence value (safe check)
silenceSelect.value = typeof silence === 'number' ? silence / 1000 : silence;

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
        loadVerseAudio(getCurrentChapter(), getCurrentVerse());        
        initAudioPlayer();
    }
});

stopBtn.addEventListener('click', () => {
    autoPlay = false;
    stopAudio();
});

playOneBtn.addEventListener('click', () => {
    autoPlay = false;
    loadVerseAudio(getCurrentChapter(), getCurrentVerse());
    initAudioPlayer();
});

const playControl1 = document.getElementById("playControl1"); // the button bar
const playControl2 = document.getElementById("playControl2"); // the panel
const settingsBtn  = document.getElementById("settingsBtn");

// Toggle playControl2 when settingsBtn is clicked
settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent triggering the document click
    playControl2.classList.toggle("show");
});

// Prevent clicks inside playControl2 from closing it
playControl2.addEventListener("click", (e) => {
    e.stopPropagation();
});

// Hide when clicking anywhere else on the page
document.addEventListener("click", (e) => {
    if (playControl2.classList.contains("show")) {
        playControl2.classList.remove("show");
    }
});



function initAudioPlayer() {
    if (!audioPlayer) {
        audioPlayer = new Audio();
    }

    stopBtn.classList.add('playing');

    // Reset listeners
    audioPlayer.onended = async function () {
        playCount++;

        if (playCount < repeat) {
            // Repeat same verse after silence
            setTimeout(() => {
                audioPlayer.currentTime = 0;
                audioPlayer.play().catch(err => {
                    console.warn("Play blocked:", err);
                });
            }, getSilenceDelay());
        } else if (autoPlay) {
            const isLastVerse = isAtLastVerse();
            if (!isLastVerse) {
                incrementVerse();
                setTimeout(() => {
                    playCount = 0;
                    handleAudioVerseChange(getCurrentChapter(), getCurrentVerse());
                }, getSilenceDelay());
            } else {
                autoPlay = false;
                stopBtn.classList.remove('playing');
            }
        } else {
            stopBtn.classList.remove('playing');
        }
    };
}

// Calculates silence delay based on selected option
function getSilenceDelay() {
    if (typeof silence === 'string' && silence.endsWith('X')) {
        const multiplier = parseInt(silence.replace('X', ''), 10);
        if (audioPlayer && !isNaN(audioPlayer.duration)) {
            return Math.round(audioPlayer.duration * 1000 * multiplier);
        }
        return 1000; // fallback
    } else {
        return silence;
    }
}

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
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

function padNumber(num) {
    return num.toString().padStart(3, '0');
}

// Dummy functions
function showLoadingStatus(msg) { console.log(msg); }
function hideLoadingStatus() { console.log("Loaded"); }

// Helpers to get current chapter/verse from UI
function getCurrentChapter() {
    return parseInt(document.getElementById('chapterSelect').value);
}
function getCurrentVerse() {
    return parseInt(document.getElementById('verseSelect').value);
}

function handleAudioVerseChange(chapter, verse) {
    stopAudio();

    if (!audioPlayer) {
        audioPlayer = new Audio();
    }

    const chapter_padded = padNumber(chapter);
    const verse_padded = padNumber(verse);
    const audioPath = `data/sounds/${reciter}/${chapter_padded}${verse_padded}.mp3`;

    audioPlayer.src = audioPath;
    audioPlayer.load();

    showLoadingStatus(`Loading verse ${chapter}:${verse}...`);

    audioPlayer.addEventListener('canplaythrough', () => {
        hideLoadingStatus();

        // 🔑 Only play if already in play mode (autoPlay or playOne)
        if (autoPlay || stopBtn.classList.contains("playing")) {
            audioPlayer.play().catch(err => {
                console.warn("Autoplay blocked, waiting for user gesture:", err);
            });
        }
    }, { once: true });

    audioPlayer.addEventListener('error', () => {
        console.error(`Failed to load: ${audioPath}`);
        hideLoadingStatus();
        stopBtn.classList.remove('playing');
    }, { once: true });

    playCount = 0; // reset repeat counter
    initAudioPlayer();
}


function loadVerseAudio(chapter, verse) {
    if (!audioPlayer) {
        audioPlayer = new Audio();
    }

    const chapter_padded = padNumber(chapter);
    const verse_padded = padNumber(verse);
    const audioPath = `data/sounds/${reciter}/${chapter_padded}${verse_padded}.mp3`;

    audioPlayer.src = audioPath;
    audioPlayer.load();

    showLoadingStatus(`Loading verse ${chapter}:${verse}...`);

    audioPlayer.addEventListener('canplaythrough', () => {
        hideLoadingStatus();

        // only play if in play mode
        if (autoPlay || stopBtn.classList.contains("playing")) {
            audioPlayer.play().catch(err => {
                console.warn("Autoplay blocked, waiting for user gesture:", err);
            });
        }
    }, { once: true });

    audioPlayer.addEventListener('error', () => {
        console.error(`Failed to load: ${audioPath}`);
        hideLoadingStatus();
        stopBtn.classList.remove('playing');
    }, { once: true });
}

function handleAudioVerseChange(chapter, verse) {
    playCount = 0;      // reset repeat counter
    loadVerseAudio(chapter, verse);

    // 🔑 only set up repeat/autoplay loop if in play mode
    if (autoPlay || stopBtn.classList.contains("playing")) {
        initAudioPlayer();
    }
}

