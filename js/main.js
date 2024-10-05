// Main JS file that handles page initialization and events

// Function to filter chapters based on the search input
function filterChapters() {
    const searchInput = document.getElementById('chapterSearchInput').value.toLowerCase();
    const chapterSelect = document.getElementById('chapterSelect');
    const options = chapterSelect.options;

    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent.toLowerCase();
        // Show or hide options based on the search input
        options[i].style.display = optionText.includes(searchInput) ? '' : 'none';
    }
}

// Function to increment the verse
function incrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    const currentVerseIndex = verseSelect.selectedIndex;
    
    if (currentVerseIndex < verseSelect.options.length - 1) {
        // Move to the next verse
        verseSelect.selectedIndex = currentVerseIndex + 1;
        displayVerseWithAnalyses();
    }
}

// Function to decrement the verse
function decrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    const currentVerseIndex = verseSelect.selectedIndex;
    
    if (currentVerseIndex > 0) {
        // Move to the previous verse
        verseSelect.selectedIndex = currentVerseIndex - 1;
        displayVerseWithAnalyses();
    }
}



// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const selectedChapter = chapterSelect.value;
    fetchSurahVerses(selectedChapter);
    displayVerseWithAnalyses();    
}

function onVerseChange() {
    displayVerseWithAnalyses();
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

                // Restore the topics
                topics = fullState.topics || [];
                populateTopicsDropdown();

                // Restore the current topic
                const currentTopic = fullState.currentTopic || '';
                document.getElementById('topicSelect').value = currentTopic;

                const topic = topics.find(topic => topic.topicName === currentTopic);
                if (topic) {
                    document.getElementById('questionInput').value = topic.questionInput || '';
                    document.getElementById('answerInput').value = topic.answerInput || '';

                    // Clear current stacked verses
                    document.getElementById('stackedVerses').innerHTML = '';

                    // Prepare the verses to fetch
                    const versesToFetch = topic.verses.map(({ surahNumber, verseNumber }) => ({ surahNumber, verseNumber }));

                    // Batch fetch the verses
                    const fetchedVerses = await fetchVersesBatch(versesToFetch);

                    // Iterate through the fetched verses and add them to the stack
                    for (let i = 0; i < fetchedVerses.length; i++) {
                        const { surahNumber, verseNumber, verseNotes } = topic.verses[i];
                        const verseData = fetchedVerses[i];

                        if (verseData) {
                            // Add the verse to the stacked verses
                            await addVerse(surahNumber, verseNumber);

                            // Update the notes for the newly added verse
                            const stackedVerses = document.getElementById('stackedVerses').children;
                            const lastVerseDiv = stackedVerses[0]; // Get the most recently added verse
                            const textArea = lastVerseDiv.querySelector('textarea');
                            if (textArea) {
                                textArea.value = verseNotes || "";
                            }
                        }
                    }
                }

                // Restore the current chapter and verse
                const currentChapter = fullState.currentChapter || '';
                const currentVerse = fullState.currentVerse || '';
                document.getElementById('chapterSelect').value = currentChapter;
                await fetchSurahVerses(currentChapter);
                document.getElementById('verseSelect').value = currentVerse;

                // Display the verse with analyses
                displayVerseWithAnalyses();

                console.log("State loaded successfully.");
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
        // Flip the arrow key actions: Right key now moves to the previous page, Left key moves to the next page
        if (event.key === 'ArrowRight') {
            decrementVerse(); // Move to the next page
        }
        
        if (event.key === 'ArrowLeft') {
            incrementVerse(); // Move to the previous page
        }
});


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


    
window.onload = async function () {
    await loadMetadata(); // Initialize the page by loading metadata
    await importTemplateData();
    const randomChapter = Math.floor(Math.random() * 114) + 1;
    const tempPath = `data/surah/surah_${randomChapter}.json`;
    const response = await fetch(tempPath);
    tempSurah = await response.json();
    const tempVerseCount =  tempSurah.verses.length;
    const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
    selectStackedVerse(randomChapter, randomVerse);

};