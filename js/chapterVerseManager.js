// Populate Surah dropdown
function populateChapters() {
    const chapterSelect = document.getElementById('chapterSelect');
    chapterSelect.innerHTML = ''; // Clear previous options

    quranMetadata.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
        chapterSelect.appendChild(option);
    });

    // Auto-load verses for the first chapter
    onChapterChange();
}

// Populate verses dropdown for the selected Surah
function populateVerses(verses) {
    const verseSelect = document.getElementById('verseSelect');
    verseSelect.innerHTML = ''; // Clear previous options

    if (!verses || verses.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No verses available';
        verseSelect.appendChild(option);
    } else {
        verses.forEach(verse => {
            const option = document.createElement('option');
            option.value = verse.number;
            option.textContent = `${verse.number}`;
            verseSelect.appendChild(option);
        });

        // Auto-display the first verse
        displayVerseWithAnalyses();
    }
}
