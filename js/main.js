// Main JS file that handles page initialization and events

// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const selectedChapter = chapterSelect.value;
    fetchSurahVerses(selectedChapter);
}

// Initialize the page by loading metadata
window.onload = loadMetadata;

// Load a saved state from a file (fixed to work on first click)
function loadState(event) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = function(event) {
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
    };

    fileInput.click();
}
