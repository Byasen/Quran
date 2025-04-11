    let audioPlayer = null;

    document.getElementById('playAudioBtn').addEventListener('click', () => {
        const chapter = document.getElementById('chapterSelect').value;
        const verse = document.getElementById('verseSelect').value;
        const chapter_padded = padNumber(chapter);
        const verse_padded = padNumber(verse);
        const audioPath = `data/sounds/Abdallah-Basfar/${chapter_padded}/${chapter_padded}${verse_padded}.mp3`;
    
        const playBtn = document.getElementById('playAudioBtn');
    
        // Stop and reset any currently playing audio
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            playBtn.classList.remove('playing');
        }
    
        showLoadingStatus("Loading audio...");
    
        audioPlayer = new Audio(audioPath);
    
        // When audio is ready, play it
        audioPlayer.addEventListener('canplaythrough', () => {
            hideLoadingStatus();
            audioPlayer.play()
                .then(() => playBtn.classList.add('playing'))
                .catch(err => {
                    console.error("Playback error:", err);
                    playBtn.classList.remove('playing');
                });
        });
    
        // If loading fails
        audioPlayer.addEventListener('error', () => {
            console.error(`Failed to load: ${audioPath}`);
            hideLoadingStatus();
            playBtn.classList.remove('playing');
        });
    
        // When audio ends
        audioPlayer.addEventListener('ended', () => {
            playBtn.classList.remove('playing');
        });
    
        // Start loading
        audioPlayer.load();
    });
    
    document.getElementById('stopAudioBtn').addEventListener('click', () => {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            document.getElementById('playAudioBtn').classList.remove('playing');
        }
    });
    