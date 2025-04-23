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
    }
}

// Fetch the verses of a selected Surah (no padding for Surah number)
async function fetchSurahVerses(surahNumber) {
    const filePath = `data/surah/surah_${surahNumber}.json`;

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
    }

}

// Fetch a specific verse (padding for verse number only)
async function fetchVerse(chapterNumber, verseNumber) {
    const filePath = `data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`;

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
        return null;
    }
}



// Populate Surah dropdown
function populateChapters() {
    const chapterSelect = document.getElementById('chapterSelect'); // Traditional dropdown

    chapterSelect.innerHTML = ''; // Clear previous options

    quranMetadata.forEach(surah => {
        // Populate traditional dropdown
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
        chapterSelect.appendChild(option);
    }); // Close forEach and add semicolon
}


function initializeChapterSelect() {
    const element = document.getElementById('chapterSelect');
    new Choices(element, {
      searchEnabled: true,
      itemSelectText: '',
      shouldSort: false,
      placeholder: true,
      placeholderValue: 'ابحث في أسماء السور'
    });
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

    }
}

function initializeVersesSelect() {
    const element = document.getElementById('verseSelect');
    new Choices(element, {
      searchEnabled: true,
      itemSelectText: '',
      shouldSort: false,
      placeholder: true,
      placeholderValue: 'رقم الآية'
    });
}



// Populate Quran pages dropdown
function populatePages() {
    const pageSelect = document.getElementById('pageSelect');
    pageSelect.innerHTML = ''; // Clear previous options

    for (let i = 1; i <= 604; i++) { // Quran has 604 pages
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}`;
        pageSelect.appendChild(option);
    }
}

function initializePageSelect() {
    const element = document.getElementById('pageSelect');
    new Choices(element, {
      searchEnabled: true,
      itemSelectText: '',
      shouldSort: false,
      placeholder: true,
      placeholderValue: 'رقم الصفحة'
    });
}

async function selectRandomVerse() {
    const randomChapter = Math.floor(Math.random() * 114) + 1;
    const tempPath = `data/surah/surah_${randomChapter}.json`;
    const response = await fetch(tempPath);
    tempSurah = await response.json();
    const tempVerseCount =  tempSurah.verses.length;
    const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
    selectThisVerse(randomChapter, randomVerse);
}

// Function to handle selecting a stacked verse
function selectThisVerse(chapterNumber, verseNumber) {
    // Set the dropdowns to the correct Surah and Verse
    document.getElementById('chapterSelect').value = chapterNumber;
    fetchSurahVerses(chapterNumber).then(() => {
        document.getElementById('verseSelect').value = verseNumber;

        // Call displayVerseWithAnalyses to update the verse and analyses automatically
        displayVerseWithAnalyses(); // Update the verse display
    });
}


// Function to handle selecting a stacked verse
function selectThisVerseNoPageChange(chapterNumber, verseNumber) {
    // Set the dropdowns to the correct Surah and Verse
    document.getElementById('chapterSelect').value = chapterNumber;
    fetchSurahVerses(chapterNumber).then(() => {
        document.getElementById('verseSelect').value = verseNumber;

        // Call displayVerseWithAnalyses to update the verse and analyses automatically
        displayVerseWithAnalysesNoPageChange(); // Update the verse display
    });
}




// Function to batch fetch verses
async function fetchVersesBatch(versesToFetch) {
    const fetchPromises = versesToFetch.map(({ surahNumber, verseNumber }) => {
        // Fetch the verse
        return fetchVerse(surahNumber, verseNumber);
    });

    return Promise.all(fetchPromises);
}