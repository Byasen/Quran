let audioPlayer = null;
let autoPlay = false;

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

    audioPlayer = new Audio(audioPath);
    playOneBtn.classList.add('playing')

    audioPlayer.addEventListener('canplaythrough', () => {
        hideLoadingStatus();
        audioPlayer.play();
    });

    audioPlayer.addEventListener('error', () => {
        console.error(`Failed to load: ${audioPath}`);
        hideLoadingStatus();
        playOneBtn.classList.remove('playing');
    });

    audioPlayer.addEventListener('ended', () => {
        if (autoPlay) {
            const isLastVerse = verseSelect.selectedIndex === verseSelect.options.length - 1;
            if (!isLastVerse) {
                incrementVerse();
                setTimeout(() => {
                    if (autoPlay) {
                        playCurrentVerse();
                    }
                }, 500);
            } else {
                autoPlay = false; // Stop autoPlay after last verse
                playOneBtn.classList.remove('playing');
            }
        }else {
            playOneBtn.classList.remove('playing');
        }
    });

    audioPlayer.load();
}

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute('src');
        audioPlayer.load();
    }
    playOneBtn.classList.remove('playing');
} 
