// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
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

}




// Automatically detect changes in the dropdown menus
document.getElementById('pageSelect').addEventListener('change', function () {
    const selectedPage = parseInt(this.value);
    displayQuranPagesWithHighlight(selectedPage, null); // Null since no specific verse is selected
});

document.getElementById('chapterSelect').addEventListener('change', function () {
    onChapterChange(); // Trigger chapter change logic
});

document.getElementById('verseSelect').addEventListener('change', function () {
    onVerseChange(); // Trigger verse change logic
});


window.onload = async function () {
    checkMobileMode();
    await loadMetadata(); // Initialize the page by loading metadata
    await loadCSVData(); // Load `quranText.csv` file
    await importTemplateData();
    const randomChapter = Math.floor(Math.random() * 114) + 1;
    const tempPath = `data/surah/surah_${randomChapter}.json`;
    const response = await fetch(tempPath);
    tempSurah = await response.json();
    populatePages(); // Initialize the Quran page dropdown
    const tempVerseCount =  tempSurah.verses.length;
    const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
    selectThisVerse(randomChapter, randomVerse);
    selectRandomWordAndSearch();
};


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