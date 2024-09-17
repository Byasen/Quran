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
            option.textContent = `Verse ${verse.number}`;
            verseSelect.appendChild(option);
        });

        // Auto-display the first verse
        displayVerse();
    }
}

// Display the selected verse in the upper section
async function displayVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        verseDisplay.innerHTML = `
            <strong>Arabic:</strong> ${verseData.text.ar}<br>
            <strong>English:</strong> ${verseData.text.en}
        `;
    } else {
        verseDisplay.textContent = 'Verse not available.';
    }
}

// Add the selected verse to the stacked section
async function addVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const stackedVerses = document.getElementById('stackedVerses');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;
    const selectedSurah = quranMetadata.find(surah => surah.number == selectedChapter);

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        // Create a new div to hold the verse content and remove button
        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse');
        newVerseDiv.innerHTML = `
            <strong>Surah ${selectedSurah.number}: ${selectedSurah.name.en} (${selectedSurah.name.ar}), Ayah ${selectedVerse}</strong><br>
            <strong>Arabic:</strong> ${verseData.text.ar}<br>
            <strong>English:</strong> ${verseData.text.en}
            <br><button onclick="removeVerse(this)">Remove</button>
        `;

        // Add a dashed line between verses
        const dashedLine = document.createElement('hr');
        dashedLine.classList.add('dashed-line');

        // Append the new verse and dashed line to the stacked section
        stackedVerses.appendChild(newVerseDiv);
        stackedVerses.appendChild(dashedLine);
    }
}

// Remove a verse from the stacked section
function removeVerse(element) {
    const verseDiv = element.parentElement; // Get the verse div
    const dashedLine = verseDiv.nextElementSibling; // Get the dashed line after the verse

    verseDiv.remove(); // Remove the verse
    if (dashedLine) {
        dashedLine.remove(); // Remove the dashed line
    }
}

// Save the current state to a file, including user input
function saveState() {
    const stackedVerses = document.getElementById('stackedVerses').children;
    const state = [];

    // Loop through stacked verses and save the Surah and Verse numbers
    for (let i = 0; i < stackedVerses.length; i += 2) {
        const verseDiv = stackedVerses[i];
        const surahInfo = verseDiv.querySelector('strong').textContent.match(/Surah (\d+): .* Ayah (\d+)/);
        if (surahInfo) {
            const [_, surahNumber, verseNumber] = surahInfo;
            state.push({ surahNumber, verseNumber });
        }
    }

    // Get the text box content
    const userInput = document.getElementById('userInput').value;

    // Save both the verses and the text box content to the state
    const fullState = {
        verses: state,
        userInput: userInput
    };

    // Create a downloadable file with the state
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quran_state.json';  // The filename for the saved file

    // Append link to body, click it to start download, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Load a saved state from a file
function loadState(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const fullState = JSON.parse(e.target.result);

        // Restore the stacked verses and the text box content
        restoreState(fullState.verses);
        document.getElementById('userInput').value = fullState.userInput || '';
    };

    if (file) {
        reader.readAsText(file);
    }
}

// Restore the saved state (for the verses)
async function restoreState(state) {
    // Clear current stacked verses
    document.getElementById('stackedVerses').innerHTML = '';

    for (const { surahNumber, verseNumber } of state) {
        // Set the dropdown to the correct Surah and Verse, and add them to the stack
        document.getElementById('chapterSelect').value = surahNumber;
        await fetchSurahVerses(surahNumber); // Populate the verses for the Surah
        document.getElementById('verseSelect').value = verseNumber;
        addVerse(); // Add the verse to the stacked section
    }
}
