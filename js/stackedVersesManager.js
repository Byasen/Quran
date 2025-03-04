// Add the selected verse to the stacked section
async function addVerse(chapterNumberLoc, verseNumberLoc) {
    const chapterSelect = chapterNumberLoc;
    const verseSelect = verseNumberLoc;
    const stackedVerses = document.getElementById('stackedVerses');

    const selectedChapter = chapterSelect;
    const selectedVerse = verseSelect;
    const selectedSurah = quranMetadata.find(surah => surah.number == selectedChapter);

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse-container'); // Updated class name for better structure
        newVerseDiv.innerHTML = `
            <strong>سورة ${selectedSurah.number}: ${selectedSurah.name.ar} (آية ${selectedVerse})</strong><br>
            ${verseData.text.ar}
            <br>
            <button onclick="removeVerse(this)">إزالة</button>
            <button onclick="selectStackedVerse(${selectedChapter}, ${selectedVerse})">عرض</button>
            <button onclick="moveVerseUp(this)">أعلى</button>
            <button onclick="moveVerseDown(this)">أسفل</button>
        `;

        const notesTextArea = document.createElement('textarea');
        notesTextArea.placeholder = "أدخل سبب إستعمال هذه الآية";
        notesTextArea.rows = 3;
        notesTextArea.style.width = '100%';

        newVerseDiv.appendChild(notesTextArea);

        // Add the new verse to the top of the stacked verses
        stackedVerses.insertBefore(newVerseDiv, stackedVerses.firstChild);
    }
}

// Function to remove a verse from the stacked section
function removeVerse(button) {
    const verseDiv = button.parentElement;
    const dashedLine = verseDiv.nextElementSibling;

    // Remove both the verse div and its dashed line
    verseDiv.remove();
    if (dashedLine && dashedLine.classList.contains('dashed-line')) {
        dashedLine.remove();
    }
}

// Function to handle selecting a stacked verse
function selectStackedVerse(chapterNumber, verseNumber) {
    // Set the dropdowns to the correct Surah and Verse
    document.getElementById('chapterSelect').value = chapterNumber;
    fetchSurahVerses(chapterNumber).then(() => {
        document.getElementById('verseSelect').value = verseNumber;

        // Call displayVerseWithAnalyses to update the verse and analyses automatically
        displayVerseWithAnalyses(); // Update the verse display
    });
}

function moveVerseUp(button) {
    const currentVerse = button.closest('.verse-container');
    const previousVerse = currentVerse.previousElementSibling;

    if (previousVerse) {
        currentVerse.parentNode.insertBefore(currentVerse, previousVerse);
    }
}

function moveVerseDown(button) {
    const currentVerse = button.closest('.verse-container');
    const nextVerse = currentVerse.nextElementSibling;

    if (nextVerse) {
        currentVerse.parentNode.insertBefore(nextVerse, currentVerse);
    }
}



