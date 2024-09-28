let topics = []; // This will hold the topics

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

    // Prepare data for download
    const jsonData = JSON.stringify({ topics }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Create a download link
    a.href = url;
    a.download = 'quran_state.json'; // Specify the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Save the current state without opening a new tab (for Ctrl+S)
function saveStateNoNewTab() {
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

    // Save the data without opening a new tab (only log it)
    const jsonData = JSON.stringify({ topics }, null, 2);
    console.log("State saved (Ctrl+S):", jsonData);
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
    console.log("Data exported to local storage.");
}

// Import state from local storage (for Import Local button)
function importFromLocal() {
    const jsonData = localStorage.getItem('quranData');
    if (!jsonData) {
        console.error("No data found in local storage.");
        return;
    }

    try {
        const fullState = JSON.parse(jsonData);

        // Assign the loaded topics to the global topics array
        topics = fullState.topics || [];

        // Populate the topics dropdown with the newly loaded topics
        populateTopicsDropdown();

        // Optionally, auto-select the first topic after loading
        if (topics.length > 0) {
            document.getElementById('topicSelect').value = topics[0].topicName;
            restoreState(); // Restore the first topic's state
        }

        console.log("Data imported from local storage.");
    } catch (error) {
        console.error("Error parsing or restoring state from local storage:", error.message);
    }
}

async function restoreState() {
    const selectedTopic = document.getElementById('topicSelect').value;

    if (!selectedTopic) {
        console.error("No topic selected.");
        return;
    }

    const topic = topics.find(topic => topic.topicName === selectedTopic);

    if (!topic) {
        console.error("Selected topic not found:", selectedTopic);
        return;
    }

    console.log("Restoring state for topic:", topic);

    // Clear current stacked verses
    document.getElementById('stackedVerses').innerHTML = '';

    for (const { surahNumber, verseNumber, verseNotes } of topic.verses) {
        // Set the chapter dropdown to the selected surah
        document.getElementById('chapterSelect').value = surahNumber;

        // Fetch verses for the selected surah
        await fetchSurahVerses(surahNumber);

        // Set the verse dropdown to the selected verse
        document.getElementById('verseSelect').value = verseNumber;

        // Add the verse to the stacked verses
        await addVerse();

        // Update the notes for the last stacked verse
        const stackedVerses = document.getElementById('stackedVerses').children;
        const lastVerseDiv = stackedVerses[stackedVerses.length - 2];
        const textArea = lastVerseDiv.querySelector('textarea');
        if (textArea) {
            textArea.value = verseNotes || "";
        }
    }

    // Restore the question and answer input fields
    document.getElementById('questionInput').value = topic.questionInput || '';
    document.getElementById('answerInput').value = topic.answerInput || '';

    // Restore the previously selected chapter and verse
    if (previousChapter && previousVerse) {
        document.getElementById('chapterSelect').value = previousChapter;
        await fetchSurahVerses(previousChapter);
        document.getElementById('verseSelect').value = previousVerse;
    }

    console.log("State restored successfully for topic:", selectedTopic);
}

// Populate the topic dropdown
function populateTopicsDropdown() {
    const topicSelect = document.getElementById('topicSelect');
    topicSelect.innerHTML = '';

    if (topics.length === 0) {
        console.warn("No topics available to populate.");
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
let previousChapter = null;
let previousVerse = null;

function onTopicChange() {
    // Store the currently selected chapter and verse
    previousChapter = document.getElementById('chapterSelect').value;
    previousVerse = document.getElementById('verseSelect').value;
    
    // Restore the state based on the selected topic
    restoreState();
}

// Add a new topic or edit an existing one
function addOrEditTopic() {
    const topicInput = document.getElementById('newTopicInput').value;
    const existingTopic = topics.find(topic => topic.topicName === topicInput);

    if (existingTopic) {
        alert("Topic already exists. You can edit the existing topic.");
    } else {
        topics.push({ topicName: topicInput, verses: [], questionInput: '', answerInput: '' });
        populateTopicsDropdown();
    }
}

// Remove an existing topic
function removeTopic() {
    const selectedTopic = document.getElementById('topicSelect').value;
    topics = topics.filter(topic => topic.topicName !== selectedTopic);
    populateTopicsDropdown();
}
