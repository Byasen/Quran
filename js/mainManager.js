// Global state
let chapterNumberGlobal = "";
let verseNumberGlobal = "";

// Update function (reusable)
function updateChapterVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect')
    chapterNumberGlobal = chapterSelect.value;
    verseNumberGlobal = verseSelect.value;
    saveStateToLocal();
}



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
        displayQuranPagesWithHighlight(chapterSelect.value, verseSelect.value);
    });
}


function onVerseChange() {
    const chapterSelect = document.getElementById('chapterSelect');    
    const verseSelect = document.getElementById('verseSelect');
    displayVerseWithAnalyses();
    displayQuranPagesWithHighlight(chapterSelect.value, verseSelect.value);
}



function onTopicChange() {
    // Store the currently selected chapter and verse
    previousChapter = document.getElementById('chapterSelect').value;
    previousVerse = document.getElementById('verseSelect').value;
    
    // Restore the state based on the selected topic
    restoreState();

}



window.onload = async function () {
    loadAnalysisOptions();
    await loadMetadata(); // Initialize the page by loading metadata
    await loadCSVData(); // Load `quranText.csv` file
    loadStateFromLocal(); // Load the state from local storage
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