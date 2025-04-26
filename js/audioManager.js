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
    stopAudio(); // Stop old audio

    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const chapter = chapterSelect.value;
    const verse = verseSelect.value;
    const chapter_padded = padNumber(chapter);
    const verse_padded = padNumber(verse);
    const audioPath = `data/sounds/Abdallah-Basfar/${chapter_padded}/${chapter_padded}${verse_padded}.mp3`;

    showLoadingStatus("Loading audio...");
    stopBtn.classList.add('playing');

    audioPlayer = new Audio(audioPath); // <<< Create Audio immediately after user click

    let playCount = 0;

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
        const delay = autoPlay ? silence : 0;

        if (playCount < repeat) {
            setTimeout(() => {
                if (audioPlayer) {
                    audioPlayer.currentTime = 0;
                    audioPlayer.play();
                }
            }, delay);
        } else if (autoPlay) {
            const isLastVerse = verseSelect.selectedIndex === verseSelect.options.length - 1;
            if (!isLastVerse) {
                incrementVerse();
                setTimeout(() => {
                    if (autoPlay) {
                        playCurrentVerse();
                    }
                }, delay);
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

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute('src');
        audioPlayer.load();
        audioPlayer = null;
    }
    stopBtn.classList.remove('playing');
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
function incrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    if (verseSelect.selectedIndex < verseSelect.options.length - 1) {
        verseSelect.selectedIndex++;
    }
}
