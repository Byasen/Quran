let audioPlayer = document.getElementById('audioPlayer');
let autoPlay = false;

// Global variables
let repeat = 1;
let silence = 0; // milliseconds
let reciter = 'abdullah_basfar';
let playCount = 0; // repeat counter

// DOM elements
const reciterSelect = document.getElementById('reciter');
const repeatSelect = document.getElementById('repeatSelect');
const silenceSelect = document.getElementById('silenceSelect');
const playBtn = document.getElementById('playAudioBtn');
const stopBtn = document.getElementById('stopAudioBtn');
const playOneBtn = document.getElementById('playOneAudioBtn');
const settingsBtn = document.getElementById("settingsBtn");
const playControl2 = document.getElementById("playControl2");

// --------- Event Listeners ---------

reciterSelect.addEventListener('change', () => {
    reciter = reciterSelect.value;
    saveStateToLocal();
});

// Populate Repeat dropdown
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
const silenceOptions = document.createDocumentFragment();
for (let i = 0; i <= 60; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} sec`;
    silenceOptions.appendChild(option);
}
['1X', '2X', '3X'].forEach(x => {
    const option = document.createElement('option');
    option.value = x;
    option.textContent = x;
    silenceOptions.appendChild(option);
});
silenceSelect.appendChild(silenceOptions);
silenceSelect.value = typeof silence === 'number' ? silence / 1000 : silence;
silenceSelect.addEventListener('change', () => {
    const value = silenceSelect.value;
    if (value.endsWith('X')) {
        silence = value; // store as "1X", "2X"
    } else {
        silence = parseInt(value) * 1000; // milliseconds
    }
    saveStateToLocal();
});

// Play / Stop buttons
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

// Settings toggle
settingsBtn.addEventListener("click", e => {
    e.stopPropagation();
    playControl2.classList.toggle("show");
});
playControl2.addEventListener("click", e => e.stopPropagation());
document.addEventListener("click", () => {
    if (playControl2.classList.contains("show")) playControl2.classList.remove("show");
});

// --------- Audio Functions ---------

function initAudioPlayer() {
    if (!audioPlayer) return;

    stopBtn.classList.add('playing');

    audioPlayer.onended = function () {
        playCount++;

        if (playCount < repeat) {
            // Repeat same verse immediately
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(err => console.warn("Play blocked:", err));
        } else if (autoPlay) {
            if (!isAtLastVerse()) {
                incrementVerse();
                playCount = 0;
                handleAudioVerseChange(getCurrentChapter(), getCurrentVerse());
            } else {
                autoPlay = false;
                stopBtn.classList.remove('playing');
            }
        } else {
            stopBtn.classList.remove('playing');
        }
    };
}

// Calculates silence delay
function getSilenceDelay() {
    if (typeof silence === 'string' && silence.endsWith('X')) {
        const multiplier = parseInt(silence.replace('X', ''), 10);
        if (audioPlayer && !isNaN(audioPlayer.duration)) {
            return Math.round(audioPlayer.duration * 1000 * multiplier);
        }
        return 1000;
    } else {
        return silence;
    }
}

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
        audioPlayer.load();
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

// Dummy loading functions
function showLoadingStatus(msg) { console.log(msg); }
function hideLoadingStatus() { console.log("Loaded"); }

function getCurrentChapter() {
    return parseInt(document.getElementById('chapterSelect').value);
}
function getCurrentVerse() {
    return parseInt(document.getElementById('verseSelect').value);
}

// Load verse audio
function loadVerseAudio(chapter, verse) {
    if (!audioPlayer) return;

    const chapter_padded = padNumber(chapter);
    const verse_padded = padNumber(verse);
    const audioPath = `data/sounds/${reciter}/${chapter_padded}${verse_padded}.mp3`;

    audioPlayer.src = audioPath;
    audioPlayer.load();
    showLoadingStatus(`Loading verse ${chapter}:${verse}...`);

    audioPlayer.addEventListener('canplaythrough', () => {
        hideLoadingStatus();
        if (autoPlay || stopBtn.classList.contains("playing")) {
            audioPlayer.play().catch(err => console.warn("Autoplay blocked:", err));
        }

        // Optional: Media Session API for background playback
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `Verse ${chapter}:${verse}`,
                artist: reciter,
                album: "Quran"
            });

            navigator.mediaSession.setActionHandler("nexttrack", () => {
                incrementVerse();
                handleAudioVerseChange(getCurrentChapter(), getCurrentVerse());
            });
            navigator.mediaSession.setActionHandler("previoustrack", () => {
                const verseSelect = document.getElementById('verseSelect');
                if (verseSelect.selectedIndex > 0) {
                    verseSelect.selectedIndex--;
                    handleAudioVerseChange(getCurrentChapter(), getCurrentVerse());
                }
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
    playCount = 0;
    loadVerseAudio(chapter, verse);

    if (autoPlay || stopBtn.classList.contains("playing")) {
        initAudioPlayer();
    }
}
