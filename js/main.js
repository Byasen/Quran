// Main JS file that handles page initialization and events

// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const selectedChapter = chapterSelect.value;
    fetchSurahVerses(selectedChapter);
}

// Initialize the page by loading metadata
window.onload = loadMetadata;

// Load a saved state from a file (modified for topics)
function loadState() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                const fullState = JSON.parse(e.target.result);

                // Log the parsed JSON to verify the structure
                console.log("Parsed JSON:", fullState);

                // Assign the loaded topics to the global topics array
                topics = fullState.topics || [];  // Ensure topics are populated
                console.log("Loaded topics:", topics);

                // Populate the topics dropdown with the newly loaded topics
                populateTopicsDropdown();

                // Optionally, you can auto-select the first topic after loading
                if (topics.length > 0) {
                    document.getElementById('topicSelect').value = topics[0].topicName;
                    await restoreState(); // Restore the first topic's state
                }
            } catch (error) {
                console.error("Error parsing or restoring state:", error.message);
            }
        };

        if (file) {
            reader.readAsText(file);
        }
    };

    fileInput.click();
}

// Add event listener to handle keyboard navigation for page changes
document.addEventListener('keydown', function(event) {
    const currentPageContainer = document.getElementById('currentPage');
    const svgElement = currentPageContainer.querySelector('svg');

    // Check if an SVG is currently displayed
    if (svgElement) {
        const currentPageNumber = parseInt(svgElement.getAttribute('data-page-number')); // Assuming the SVG has a custom attribute for the page number

        // If the left arrow key is pressed
        if (event.key === 'ArrowLeft') {
            displayQuranPagesWithHighlight(currentPageNumber + 1); // Move to the next page on left arrow
        }

        // If the right arrow key is pressed
        if (event.key === 'ArrowRight') {
            if (currentPageNumber > 1) {
                displayQuranPagesWithHighlight(currentPageNumber - 1); // Move to the previous page on right arrow
            }
        }
    }
});
