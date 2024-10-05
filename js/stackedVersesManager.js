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
        newVerseDiv.classList.add('verse');
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

        const dashedLine = document.createElement('hr');
        dashedLine.classList.add('dashed-line');

        // Add the new verse to the top of the stacked verses
        stackedVerses.insertBefore(dashedLine, stackedVerses.firstChild);
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

// Function to move a verse up
function moveVerseUp(button) {
    const verseDiv = button.parentElement; // The current verse div
    const dashedLine = verseDiv.previousElementSibling; // The dashed line before the verse
    const previousVerseDiv = dashedLine?.previousElementSibling; // The previous verse div

    if (previousVerseDiv && previousVerseDiv.classList.contains('verse')) {
        // Move the dashed line and the verse div before the previous verse div
        verseDiv.parentElement.insertBefore(dashedLine, previousVerseDiv);
        verseDiv.parentElement.insertBefore(verseDiv, dashedLine);
    }
}


// Function to move a verse down
// Function to move a verse down
// Function to move a verse down
function moveVerseDown(button) {
    const verseDiv = button.parentElement; // The current verse div
    const dashedLine = verseDiv.nextElementSibling; // The dashed line after the verse
    const nextVerseDiv = dashedLine?.nextElementSibling; // The next verse div

    if (nextVerseDiv && nextVerseDiv.classList.contains('verse')) {
        const nextDashedLine = nextVerseDiv.nextElementSibling; // The next dashed line

        // Move the current verse and dashed line after the next verse and its dashed line
        verseDiv.parentElement.insertBefore(dashedLine, nextDashedLine?.nextSibling);
        verseDiv.parentElement.insertBefore(verseDiv, dashedLine);
    }
}



