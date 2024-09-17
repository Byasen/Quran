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
