let topics = []; // This will hold the topics

// Function to batch fetch verses
async function fetchVersesBatch(versesToFetch) {
    const fetchPromises = versesToFetch.map(({ surahNumber, verseNumber }) => {
        // Fetch the verse
        return fetchVerse(surahNumber, verseNumber);
    });

    return Promise.all(fetchPromises);
}


// Save the current chapter and verse to local storage
function saveCurrentTopic() {
    const topicCurrent = document.getElementById('topicSelect').value;
    localStorage.setItem('quranTopic', JSON.stringify(topicCurrent));
}


// Save the current chapter and verse to local storage
function saveCurrentVerse() {
    const chapterSelect = document.getElementById('chapterSelect').value;
    const verseSelect = document.getElementById('verseSelect').value;

    const state = {
        currentChapter: chapterSelect,
        currentVerse: verseSelect
    };

    localStorage.setItem('quranVerse', JSON.stringify(state));
}

// Load the current chapter and verse from local storage
function loadCurrentVerse() {
    const savedState = localStorage.getItem('quranVerse');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        const chapterSelect = document.getElementById('chapterSelect');
        const verseSelect = document.getElementById('verseSelect');
        
        // Set the chapter and verse dropdowns to the saved state
        chapterSelect.value = state.currentChapter;
        
        // Trigger chapter change to populate the verse dropdown
        onChapterChange();

        // Set the verse once the dropdown is populated
        setTimeout(() => {
            verseSelect.value = state.currentVerse;
            displayVerseWithAnalyses(); // Display the verse with analyses
        }, 100);
    }
}

// Save the current state and download as a file
function saveState() {
    const selectedTopic = document.getElementById('topicSelect').value;
    const topic = topics.find(topic => topic.topicName === selectedTopic);

    if (topic) {
        const stackedVerses = document.getElementById('stackedVerses').children;
        const state = [];

        // Iterate through the stacked verses and collect the relevant information
        for (let i = 0; i < stackedVerses.length; i += 2) { // Skipping the dashed lines (hr elements)
            const verseDiv = stackedVerses[i];

            // Use regex to match and extract surah and verse information
            const surahInfo = verseDiv.querySelector('strong')?.textContent.match(/سورة (\d+): .* \(آية (\d+)\)/);

            if (surahInfo) {
                const [_, surahNumber, verseNumber] = surahInfo;

                // Retrieve the notes from the textarea
                const textArea = verseDiv.querySelector('textarea');
                const verseNotes = textArea ? textArea.value : "";

                state.push({ surahNumber, verseNumber, verseNotes }); // Save verse information and notes
            }
        }

        // Save the notes for the topic (question and answer input fields)
        topic.verses = state;
        topic.questionInput = document.getElementById('questionInput').value;
        topic.answerInput = document.getElementById('answerInput').value;
    }

    // Add the current chapter, verse, and topic to the saved data
    const currentChapter = document.getElementById('chapterSelect').value;
    const currentVerse = document.getElementById('verseSelect').value;
    const currentTopic = document.getElementById('topicSelect').value;

    // Prepare data for download
    const jsonData = JSON.stringify({ topics, currentChapter, currentVerse, currentTopic }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Create timestamp _[dd-mm-yy]-[hh-MM]
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `_[${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${pad(now.getFullYear() % 100)}]-[${pad(now.getHours())}-${pad(now.getMinutes())}]`;

    // Create a download link with timestamp
    a.href = url;
    a.download = `quran_state${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    exportToLocal(); // Export to local storage as well
}



// Export the current state to local storage (for Export Local button)
function exportToLocal() {
    const selectedTopic = document.getElementById('topicSelect').value;
    const topic = topics.find(topic => topic.topicName === selectedTopic);

    if (topic) {
        const stackedVerses = document.getElementById('stackedVerses').children;
        const state = [];

        // Iterate through the stacked verses and collect the relevant information
        for (let i = 0; i < stackedVerses.length; i += 2) { // Skipping the dashed lines (hr elements)
            const verseDiv = stackedVerses[i];
            
            // Use regex to match and extract surah and verse information
            const surahInfo = verseDiv.querySelector('strong')?.textContent.match(/سورة (\d+): .* \(آية (\d+)\)/);

            if (surahInfo) {
                const [_, surahNumber, verseNumber] = surahInfo;
                
                // Retrieve the notes from the textarea
                const textArea = verseDiv.querySelector('textarea');
                const verseNotes = textArea ? textArea.value : "";

                state.push({ surahNumber, verseNumber, verseNotes }); // Save verse information and notes
            }
        }

        // Save the notes for the topic (question and answer input fields)
        topic.verses = state;
        topic.questionInput = document.getElementById('questionInput').value;
        topic.answerInput = document.getElementById('answerInput').value;
    }

    // Save data to localStorage
    const jsonData = JSON.stringify({ topics });
    localStorage.setItem('quranData', jsonData);
    //console.log("Data exported to local storage.");

    saveCurrentVerse();
    saveCurrentTopic();  
}

// Import state from local storage (for Import Local button)
function importFromLocal() {
    const jsonData = localStorage.getItem('quranData');
    const topicData = localStorage.getItem('quranTopic');
    if (!jsonData) {
        //console.error("No data found in local storage.");
        return;
    }

    try {
        const fullState = JSON.parse(jsonData);
        const restoredTopic = JSON.parse(topicData);

        // Assign the loaded topics to the global topics array
        topics = fullState.topics || [];

        // Populate the topics dropdown with the newly loaded topics
        populateTopicsDropdown();

        topicSelect.value = restoredTopic;
        loadCurrentVerse();
        restoreState(); // Restore the first topic's state

        //console.log("Data imported from local storage.");
    } catch (error) {
        //console.error("Error parsing or restoring state from local storage:", error.message);
    }

}

async function restoreState() {
    const selectedTopic = document.getElementById('topicSelect').value;
    const topic = topics.find(topic => topic.topicName === selectedTopic);
    document.getElementById('questionInput').value = topic.questionInput || '';
    document.getElementById('answerInput').value = topic.answerInput || '';

    // Clear current stacked verses
    document.getElementById('stackedVerses').innerHTML = '';

    // Prepare the verses to fetch
    const versesToFetch = topic.verses.map(({ surahNumber, verseNumber }) => ({ surahNumber, verseNumber }));

    // Batch fetch the verses
    const fetchedVerses = await fetchVersesBatch(versesToFetch);

    // Iterate through the fetched verses and add them to the stack
    for (i = fetchedVerses.length - 1; i >= 0; i--) {
        const { surahNumber, verseNumber, verseNotes } = topic.verses[i];
        const verseData = fetchedVerses[i];

        if (verseData) {

            // Add the verse to the stacked verses
            await addVerse(surahNumber,verseNumber);

            // Update the notes for the newly added verse
            const stackedVerses = document.getElementById('stackedVerses').children;
            const lastVerseDiv = stackedVerses[0]; // Get the most recently added verse
            const textArea = lastVerseDiv.querySelector('textarea');
            if (textArea) {
                textArea.value = verseNotes || "";
            }
        }
    }

    //console.log("State restored successfully for topic:", selectedTopic);
}

// Other existing functions (saveState, addVerse, etc.) remain unchanged...


// Populate the topic dropdown
function populateTopicsDropdown() {
    const topicSelect = document.getElementById('topicSelect');
    topicSelect.innerHTML = '';

    if (topics.length === 0) {
        //console.warn("No topics available to populate.");
        return;
    }

    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.topicName;
        option.textContent = topic.topicName;
        topicSelect.appendChild(option);
    });

    if (topics.length > 0) {
        topicSelect.value = topics[0].topicName;
    }
}

// Store the currently selected chapter and verse

function onTopicChange() {
    // Store the currently selected chapter and verse
    previousChapter = document.getElementById('chapterSelect').value;
    previousVerse = document.getElementById('verseSelect').value;
    
    // Restore the state based on the selected topic
    restoreState();

}

// Function to toggle the topic input box and add the topic if applicable
function addOrEditTopic() {
    const topicInput = document.getElementById('newTopicInput');
    const addTopicButton = document.querySelector('button[onclick="addOrEditTopic()"]');

    if (topicInput.style.display === 'none' || topicInput.style.display === '') {
        // Show the topic input box and change button text to 'Add Topic'
        topicInput.style.display = 'block';
        addTopicButton.textContent = 'ادخل الموضوع للقائمة';
    } else {
        // Hide the topic input box
        topicInput.style.display = 'none';
        
        // Add the topic if input is not empty

            const existingTopic = topics.find(topic => topic.topicName === topicInput.value.trim());

            if (existingTopic) {
                alert("Topic already exists. You can edit the existing topic.");
            } else {
                topics.push({ topicName: topicInput.value.trim(), verses: [], questionInput: '', answerInput: '' });
                populateTopicsDropdown();
            }

            // Clear the input field
            
            // Change button text to 'Add New Topic'
            addTopicButton.textContent = 'ابدأ موضوعا جديداً';
            
            const topic = document.getElementById('topicSelect');
            topic.value = topicInput.value.trim(); // Set the selected topic to the new one
            topicInput.value = '';
            onTopicChange();
            toggleSidebar();

    }
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
                //console.log("Parsed JSON:", fullState);

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
                    for (i = fetchedVerses.length - 1; i >= 0; i--){
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

                //console.log("State loaded successfully.");
            } catch (error) {
                //console.error("Error parsing or restoring state:", error.message);
            }
        };

        if (file) {
            reader.readAsText(file);
        }
    };

    fileInput.click();
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
            //console.error("Error loading template data:", error.message);
        });
}