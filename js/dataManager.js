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



// Populate Surah dropdown
function populateChapters() {
    const chapterSelect = document.getElementById('chapterSelect'); // Traditional dropdown
    const dropdownSelect = document.getElementById('dropdownList'); // Custom dropdown list

    chapterSelect.innerHTML = ''; // Clear previous options
    dropdownSelect.innerHTML = ''; // Clear previous items

    quranMetadata.forEach(surah => {
        // Populate traditional dropdown
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
        chapterSelect.appendChild(option);

       // Populate custom dropdown
       const div = document.createElement('div');
       div.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
       div.setAttribute('data-value', surah.number); // Store value for reference
       
       // Call function when selection is made
       div.onclick = function () {
           document.getElementById("dropdownInput").value = this.textContent;
           document.getElementById("dropdownList").style.display = "none";
           onChapterSelect(this.getAttribute('data-value')); // Call function with chapter number
       };
       
       dropdownSelect.appendChild(div);
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