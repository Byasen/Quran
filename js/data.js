// Global variable to store the Quran metadata
let quranMetadata = [];

// Show the loading bar and status
function showLoadingStatus(message) {
    const loadingBar = document.getElementById('loadingBar');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingBarContainer = document.getElementById('loadingBarContainer');

    loadingBarContainer.style.display = 'block';
    loadingStatus.style.display = 'block'; // Ensure the loading text is visible
    loadingStatus.textContent = message;

    // Simulate progress (for demonstration, you can adjust it)
    loadingBar.value += 10;
    if (loadingBar.value > 100) loadingBar.value = 0; // Reset if it exceeds 100
}

// Hide the loading text once loading is complete but keep the bar
function hideLoadingStatus() {
    const loadingStatus = document.getElementById('loadingStatus');
    loadingStatus.style.display = 'none'; // Hide the loading text after completion
}

// Fetch Quran metadata (list of Surahs)
async function loadMetadata() {
    try {
        showLoadingStatus('Loading metadata...');
        const response = await fetch('data/metadata.json');
        if (!response.ok) {
            throw new Error('Metadata file not found');
        }
        quranMetadata = await response.json();
        populateChapters();
        hideLoadingStatus(); // Hide the loading text once the metadata is loaded
    } catch (error) {
        hideLoadingStatus(); // Hide the loading text in case of error
        appendError('Error loading metadata: ' + error.message);
    }
}

// Fetch the verses of a selected Surah (no padding for Surah number)
async function fetchSurahVerses(surahNumber) {
    const filePath = `data/surah/surah_${surahNumber}.json`;
    appendFilePath(filePath);

    try {
        showLoadingStatus(`Loading Surah ${surahNumber}...`);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Surah file not found: ${filePath}`);
        }
        currentSurah = await response.json();
        populateVerses(currentSurah.verses);
        hideLoadingStatus(); // Hide the loading text once verses are loaded
    } catch (error) {
        hideLoadingStatus(); // Hide the loading text in case of error
        appendError(`Error loading Surah ${surahNumber}: ` + error.message);
    }
}

// Fetch a specific verse (padding for verse number only)
async function fetchVerse(chapterNumber, verseNumber) {
    const filePath = `data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`;
    appendFilePath(filePath);

    try {
        showLoadingStatus(`Loading verse ${verseNumber} from chapter ${chapterNumber}...`);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Verse file not found: ${filePath}`);
        }
        hideLoadingStatus(); // Hide the loading text after verse is loaded
        return await response.json();
    } catch (error) {
        hideLoadingStatus(); // Hide the loading text in case of error
        appendError(`Error loading verse ${verseNumber} for Surah ${chapterNumber}: ` + error.message);
        return null;
    }
}

