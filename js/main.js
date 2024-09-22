// Main JS file that handles page initialization and events

// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const selectedChapter = chapterSelect.value;
    fetchSurahVerses(selectedChapter);
}



// Check all checkboxes
function checkAll() {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
}

// Uncheck all checkboxes
function uncheckAll() {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

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
    const currentPageContainer = document.getElementById('currentPage');
    const svgElement = currentPageContainer.querySelector('svg');

    // Check if an SVG is currently displayed
    if (svgElement) {
        const currentPageNumber = parseInt(svgElement.getAttribute('data-page-number')); // Assuming the SVG has a custom attribute for the page number

        // Flip the arrow key actions: Right key now moves to the previous page, Left key moves to the next page
        if (event.key === 'ArrowRight' && currentPageNumber > 1) {
            displayQuranPagesWithHighlight(currentPageNumber - 1); // Move to the previous page
        }

        if (event.key === 'ArrowLeft') {
            displayQuranPagesWithHighlight(currentPageNumber + 1); // Move to the next page
        }
    }
});

// Automatically export state to local storage on tab/browser close without warning
window.addEventListener('beforeunload', function () {
    exportToLocal(); // Automatically export to local storage
    // No event.preventDefault() or event.returnValue to suppress "Leave Site" dialog
});



// Main JS file that handles page initialization and events

// Check if the site is initiated for the first time and import the template
function checkFirstTimeInit() {
        importTemplateData();
    }

// Import the template data from "data/researches/template.json"
function importTemplateData() {
    fetch('stored/all.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Template file not found');
            }
            return response.json();
        })
        .then(data => {
            // Save the template data to localStorage
            localStorage.setItem('quranData', JSON.stringify(data));
            console.log("Template data loaded and saved to localStorage.");

            // Populate the topics dropdown with the newly loaded template data
            topics = data.topics || [];
            populateTopicsDropdown();

            // Optionally, auto-select the first topic after loading
            if (topics.length > 0) {
                document.getElementById('topicSelect').value = topics[0].topicName;
                restoreState(); // Restore the first topic's state
            }
        })
        .catch(error => {
            console.error("Error loading template data:", error.message);
        });
}

// Call the checkFirstTimeInit function when the window loads
window.onload = function () {
    
    loadMetadata(); // Initialize the page by loading metadata
    checkFirstTimeInit(); // Check and load template data if first time
};

// Other existing functions (saveState, addVerse, etc.) remain unchanged...
