window.onload = async function () {
    await loadMetadata(); // Initialize the page by loading metadata
    await importTemplateData();
    const randomChapter = Math.floor(Math.random() * 114) + 1;
    const tempPath = `data/surah/surah_${randomChapter}.json`;
    const response = await fetch(tempPath);
    tempSurah = await response.json();
    const tempVerseCount =  tempSurah.verses.length;
    const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
    selectThisVerse(randomChapter, randomVerse);
    await loadCSVData(); // Load `quranText.csv` file
    populatePages(); // Initialize the Quran page dropdown
    scrollMid();
};


// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('dropdownInput');
    const selectedChapter = chapterSelect.value;

    
    // Fetch the verses of the selected chapter
    fetchSurahVerses(selectedChapter).then(() => {
        const verseSelect = document.getElementById('verseSelect');
        
        // Reset the verse to the first one in the list
        if (verseSelect.options.length > 0) {
            verseSelect.selectedIndex = 0;
        }

        // Display the selected verse with analyses (the first verse)
        displayVerseWithAnalyses();
    });
}


function onVerseChange() {
    displayVerseWithAnalyses();
}

// Handle page change
function onPageChange() {
    const pageSelect = document.getElementById('pageSelect');
    const selectedPage = parseInt(pageSelect.value);

    // Display Quran pages and highlight the current one
    displayQuranPagesWithHighlight(selectedPage, null); // Null since no specific verse is selected
    scrollMid()
}


// Enable Ctrl+S for saving the state without opening a new tab
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent the default browser save dialog
        saveStateNoNewTab(); // Call the new function without opening a tab
        console.log("Ctrl+S pressed: State saved (no new tab).");
    }
});

// Add event listener to handle keyboard navigation for page changes
document.addEventListener('keydown', function(event) {
        // Flip the arrow key actions: Right key now moves to the previous page, Left key moves to the next page
        if (event.key === 'ArrowRight') {
            decrementVerse(); // Move to the next page
        }
        
        if (event.key === 'ArrowLeft') {
            incrementVerse(); // Move to the previous page
        }
});