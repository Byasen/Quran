let audioPlayer = null;

document.getElementById('playAudioBtn').addEventListener('click', () => {
    const chapter = document.getElementById('chapterSelect').value;
    const verse = document.getElementById('verseSelect').value;
    const audioPath = `data/sounds/${chapter}_${verse}.mp3`;

    // Stop existing audio if any
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    // Create new audio object and play
    audioPlayer = new Audio(audioPath);
    audioPlayer.play().catch(err => console.error("Audio playback error:", err));
});

document.getElementById('stopAudioBtn').addEventListener('click', () => {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
});
