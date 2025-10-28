let audioPlayer = document.getElementById('audioPlayer');
let autoPlay = false;
let repeat = 2;
let silence = 5; // seconds or "1X", "2X", "3X"
let reciter = 'alhosary';
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

// ------------------ Setup UI ------------------

// Reciter change
reciterSelect.addEventListener('change', () => {
    reciter = reciterSelect.value;
    saveStateToLocal();
});

// Repeat dropdown
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

// Silence dropdown
const silenceOptionsSec = [5, 10, 15, 25, 40, 60];
silenceOptionsSec.forEach(sec => {
    const option = document.createElement('option');
    option.value = sec;
    option.textContent = `${sec} sec`;
    silenceSelect.appendChild(option);
});
silenceSelect.value = typeof silence === 'number' ? silence : '5';
silenceSelect.addEventListener('change', () => {
    silence = parseInt(silenceSelect.value);
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

// ------------------ Audio Functions ------------------

function initAudioPlayer() {
    if (!audioPlayer) return;

    stopBtn.classList.add('playing');

    audioPlayer.onended = function () {
        playCount++;

        if (playCount < repeat) {
            // Repeat current verse after silence
            playSilence(getSilenceSeconds(), () => {
                audioPlayer.currentTime = 0;
                audioPlayer.play().catch(err => console.warn("Play blocked:", err));
            });
        } else if (autoPlay) {
            if (!isAtLastVerse()) {
                incrementVerse();
                playCount = 0;
                playSilence(getSilenceSeconds(), () => {
                    handleAudioVerseChange(getCurrentChapter(), getCurrentVerse());
                });
            } else {
                autoPlay = false;
                stopBtn.classList.remove('playing');
            }
        } else {
            stopBtn.classList.remove('playing');
        }
    };
}

function getSilenceSeconds() {
    if (typeof silence === 'string' && silence.endsWith('X')) {
        const multiplier = parseInt(silence.replace('X',''),10);
        if (audioPlayer && !isNaN(audioPlayer.duration)) {
            return Math.round(audioPlayer.duration * multiplier);
        }
        return 1; // fallback
    } else {
        return silence;
    }
}

function playSilence(seconds, callback) {
    if (seconds <= 0) {
        callback();
        return;
    }

    // Match available silence files (5,10,15,25,40,60)
    const availableSilences = [5, 10, 15, 25, 40, 60];
    let closest = availableSilences.reduce((a, b) =>
        Math.abs(b - seconds) < Math.abs(a - seconds) ? b : a
    );

    const silenceFile = `data/sounds/silence${closest}s.mp3`;
    const silentAudio = new Audio(silenceFile);

    silentAudio.onended = () => callback();
    silentAudio.onerror = () => {
        console.warn(`Missing silence file: ${silenceFile}`);
        callback();
    };

    silentAudio.play().catch(err => {
        console.warn("Silence playback blocked:", err);
        callback();
    });
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
    return num.toString().padStart(3,'0');
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

        // Optional Media Session API
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

// Dummy saveStateToLocal
function saveStateToLocal() {
    // implement your localStorage save if needed
}
