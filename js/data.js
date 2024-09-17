// Fetch Quran metadata (list of Surahs)
async function loadMetadata() {
    try {
        const response = await fetch('data/metadata.json');
        if (!response.ok) {
            throw new Error('Metadata file not found');
        }
        quranMetadata = await response.json();
        populateChapters();
    } catch (error) {
        appendError('Error loading metadata: ' + error.message);
    }
}

// Fetch the verses of a selected Surah (no padding for Surah number)
async function fetchSurahVerses(surahNumber) {
    const filePath = `data/surah/surah_${surahNumber}.json`;
    appendFilePath(filePath);

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Surah file not found: ${filePath}`);
        }
        currentSurah = await response.json();
        populateVerses(currentSurah.verses);
    } catch (error) {
        appendError(`Error loading Surah ${surahNumber}: ` + error.message);
    }
}

// Fetch a specific verse (padding for verse number only)
async function fetchVerse(chapterNumber, verseNumber) {
    const filePath = `data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`;
    appendFilePath(filePath);

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Verse file not found: ${filePath}`);
        }
        return await response.json();
    } catch (error) {
        appendError(`Error loading verse ${verseNumber} for Surah ${chapterNumber}: ` + error.message);
        return null;
    }
}
