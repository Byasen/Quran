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
        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse');
        newVerseDiv.innerHTML = `
            <strong>Surah ${selectedSurah.number}: ${selectedSurah.name.en} (${selectedSurah.name.ar}), Ayah ${selectedVerse}</strong><br>
            <strong>Arabic:</strong> ${verseData.text.ar}
            <br><button onclick="removeVerse(this)">Remove</button>
            <button onclick="selectStackedVerse(${selectedChapter}, ${selectedVerse})">Select</button>
        `;

        const notesTextArea = document.createElement('textarea');
        notesTextArea.placeholder = "Add your notes here...";
        notesTextArea.rows = 3;
        notesTextArea.style.width = '100%';

        newVerseDiv.appendChild(notesTextArea);

        const dashedLine = document.createElement('hr');
        dashedLine.classList.add('dashed-line');

        stackedVerses.appendChild(newVerseDiv);
        stackedVerses.appendChild(dashedLine);
    }
}

// Remove a verse from the stacked section
function removeVerse(element) {
    const verseDiv = element.parentElement;
    const dashedLine = verseDiv.nextElementSibling;

    verseDiv.remove();
    if (dashedLine) {
        dashedLine.remove();
    }
}

// Function to handle selecting a stacked verse
function selectStackedVerse(chapterNumber, verseNumber) {
    document.getElementById('chapterSelect').value = chapterNumber;
    fetchSurahVerses(chapterNumber).then(() => {
        document.getElementById('verseSelect').value = verseNumber;
        displayVerse();
    });
}
