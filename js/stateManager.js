let topics = []; // This will hold the topics

// Save the current state and display JSON in a new tab (for Export All button)
function saveState() {
    const selectedTopic = document.getElementById('topicSelect').value;
    const topic = topics.find(topic => topic.topicName === selectedTopic);

    if (topic) {
        const stackedVerses = document.getElementById('stackedVerses').children;
        const state = [];

        for (let i = 0; i < stackedVerses.length; i += 2) {
            const verseDiv = stackedVerses[i];
            const surahInfo = verseDiv.querySelector('strong').textContent.match(/Surah (\d+): .* Ayah (\d+)/);
            const textArea = verseDiv.querySelector('textarea');

            if (surahInfo) {
                const [_, surahNumber, verseNumber] = surahInfo;
                const verseNotes = textArea ? textArea.value : "";
                state.push({ surahNumber, verseNumber, verseNotes });
            }
        }

        // Update the selected topic's data
        topic.verses = state;
        topic.questionInput = document.getElementById('questionInput').value;
        topic.answerInput = document.getElementById('answerInput').value;
    }

    // Show saved state in new tab (old Export All functionality)
    const jsonData = JSON.stringify({ topics }, null, 2);
    const newTab = window.open();
    newTab.document.write(`<pre>${jsonData}</pre>`);
    newTab.document.title = 'Quran State JSON';
}

// Save the current state without opening a new tab
function saveStateNoNewTab() {
    const selectedTopic = document.getElementById('topicSelect').value;
    const topic = topics.find(topic => topic.topicName === selectedTopic);

    if (topic) {
        const stackedVerses = document.getElementById('stackedVerses').children;
        const state = [];

        for (let i = 0; i < stackedVerses.length; i += 2) {
            const verseDiv = stackedVerses[i];
            const surahInfo = verseDiv.querySelector('strong').textContent.match(/Surah (\d+): .* Ayah (\d+)/);
            const textArea = verseDiv.querySelector('textarea');

            if (surahInfo) {
                const [_, surahNumber, verseNumber] = surahInfo;
                const verseNotes = textArea ? textArea.value : "";
                state.push({ surahNumber, verseNumber, verseNotes });
            }
        }

        // Update the selected topic's data
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

        for (let i = 0; i < stackedVerses.length; i += 2) {
            const verseDiv = stackedVerses[i];
            const surahInfo = verseDiv.querySelector('strong').textContent.match(/Surah (\d+): .* Ayah (\d+)/);
            const textArea = verseDiv.querySelector('textarea');

            if (surahInfo) {
                const [_, surahNumber, verseNumber] = surahInfo;
                const verseNotes = textArea ? textArea.value : "";
                state.push({ surahNumber, verseNumber, verseNotes });
            }
        }

        // Update the selected topic's data
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

        // Log the parsed JSON to verify the structure
        console.log("Parsed JSON from local storage:", fullState);

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

// Restore the saved state (for the selected topic only)
async function restoreState() {
    const selectedTopic = document.getElementById('topicSelect').value;

    // Check if the selected topic is valid
    if (!selectedTopic) {
        console.error("No topic selected.");
        return;
    }

    const topic = topics.find(topic => topic.topicName === selectedTopic);

    // Debugging log to ensure the topic is being found
    if (!topic) {
        console.error("Selected topic not found:", selectedTopic);
        return; // Exit early if the topic is not found
    }

    console.log("Restoring state for topic:", topic);

    // Clear current stacked verses
    document.getElementById('stackedVerses').innerHTML = '';

    for (const { surahNumber, verseNumber, verseNotes } of topic.verses) {
        // Set the chapter dropdown to the selected surah
        document.getElementById('chapterSelect').value = surahNumber;

        // Fetch verses for the selected surah
        await fetchSurahVerses(surahNumber); // Ensure it completes before proceeding

        // Set the verse dropdown to the selected verse
        document.getElementById('verseSelect').value = verseNumber;

        // Add the verse to the stacked verses
        await addVerse(); // Ensure it completes before proceeding

        // Get the last added verse in the stack and update its notes
        const stackedVerses = document.getElementById('stackedVerses').children;
        const lastVerseDiv = stackedVerses[stackedVerses.length - 2]; // Get the last added verse (skip dashed line)
        const textArea = lastVerseDiv.querySelector('textarea');
        if (textArea) {
            textArea.value = verseNotes || ""; // Set notes if available
        }
    }

    // Restore question and answer input fields
    if (topic.questionInput !== undefined) {
        document.getElementById('questionInput').value = topic.questionInput || '';
    }

    if (topic.answerInput !== undefined) {
        document.getElementById('answerInput').value = topic.answerInput || '';
    }

    console.log("State restored successfully for topic:", selectedTopic);
}

// Add a new topic or edit an existing one
function addOrEditTopic() {
    const topicInput = document.getElementById('newTopicInput').value;
    const existingTopic = topics.find(topic => topic.topicName === topicInput);

    if (existingTopic) {
        alert("Topic already exists. You can edit the existing topic.");
    } else {
        topics.push({ topicName: topicInput, verses: [], questionInput: '', answerInput: '' });
        populateTopicsDropdown(); // Update the dropdown list with new topics
    }
}

// Remove an existing topic
function removeTopic() {
    const selectedTopic = document.getElementById('topicSelect').value;
    topics = topics.filter(topic => topic.topicName !== selectedTopic);
    populateTopicsDropdown();
}

// Populate the topic dropdown
function populateTopicsDropdown() {
    const topicSelect = document.getElementById('topicSelect');
    topicSelect.innerHTML = ''; // Clear previous options

    // Check if topics array has content
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

    // Optionally, you can auto-select the first topic
    if (topics.length > 0) {
        topicSelect.value = topics[0].topicName;
    }
}

// When a topic is selected, load its state
function onTopicChange() {
    restoreState(); // Restore the state based on the selected topic
}
