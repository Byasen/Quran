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
for (let i = 1; i <= 60; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    silenceSelect.appendChild(option);
}
silenceSelect.value = silence / 1000;
silenceSelect.addEventListener('change', () => {
    silence = parseInt(silenceSelect.value) * 1000;
    saveStateToLocal();
});

const playBtn = document.getElementById('playAudioBtn');
const stopBtn = document.getElementById('stopAudioBtn');
const playOneBtn = document.getElementById('playOneAudioBtn');

playBtn.addEventListener('click', () => {
    if (!autoPlay) {
        autoPlay = true;
        playCurrentVerse();
    }
});

stopBtn.addEventListener('click', () => {
    autoPlay = false;
    stopAudio();
});

playOneBtn.addEventListener('click', () => {
    autoPlay = false;
    playCurrentVerse();
});

function playCurrentVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const chapter = chapterSelect.value;
    const verse = verseSelect.value;
    const chapter_padded = padNumber(chapter);
    const verse_padded = padNumber(verse);
    const audioPath = `data/sounds/Abdallah-Basfar/${chapter_padded}/${chapter_padded}${verse_padded}.mp3`;

    showLoadingStatus("Loading audio...");
    stopBtn.classList.add('playing');

    let playCount = 0;

    function playRepeat() {
        if (!autoPlay && playCount > 0) {
            stopBtn.classList.remove('playing');
            return;
        }

        audioPlayer = new Audio(audioPath);

        audioPlayer.addEventListener('canplaythrough', () => {
            hideLoadingStatus();
            audioPlayer.play();
        });

        audioPlayer.addEventListener('error', () => {
            console.error(`Failed to load: ${audioPath}`);
            hideLoadingStatus();
            stopBtn.classList.remove('playing');
        });

        audioPlayer.addEventListener('ended', () => {
            playCount++;
            if (playCount < repeat) {
                const delay = autoPlay ? silence : 0;
                setTimeout(playRepeat, delay);
            } else if (autoPlay) {
                const isLastVerse = verseSelect.selectedIndex === verseSelect.options.length - 1;
                if (!isLastVerse) {
                    incrementVerse();
                    setTimeout(() => {
                        if (autoPlay) {
                            stopAudio(); // <--- FIX: stop old audio before moving to next verse
                            playCurrentVerse();
                        }
                    }, silence);
                } else {
                    autoPlay = false;
                    stopBtn.classList.remove('playing');
                }
            } else {
                stopBtn.classList.remove('playing');
            }
        });

        audioPlayer.load();
    }

    playRepeat();
}

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute('src');
        audioPlayer.load();
        audioPlayer = null; // Important: destroy old player
    }
    stopBtn.classList.remove('playing');
}

// Helper function to pad chapter and verse numbers
function padNumber(num) {
    return num.toString().padStart(3, '0');
}

// Placeholder UI helper functions
function showLoadingStatus(message) {
    console.log(message); // Replace with your real loading UI if needed
}

function hideLoadingStatus() {
    console.log("Audio loaded");
}

// Save state placeholder
function saveStateToLocal() {
    // Save repeat/silence settings if needed
}

// Increment verse
function incrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    if (verseSelect.selectedIndex < verseSelect.options.length - 1) {
        verseSelect.selectedIndex++;
    }
}
