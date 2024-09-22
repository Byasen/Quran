// Main JS file that handles page initialization and events

// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const selectedChapter = chapterSelect.value;
    fetchSurahVerses(selectedChapter);
}

// Initialize the page by loading metadata
window.onload = function () {
    loadMetadata();
    setupTextboxBlurEvents(); // Setup blur events for all textboxes
};

// Automatically save when exiting any textbox (blur event)
function setupTextboxBlurEvents() {
    const textboxes = document.querySelectorAll('textarea, input[type="text"]');
    textboxes.forEach(textbox => {
        textbox.addEventListener('blur', function() {
            saveStateAndUpdate(); // Automatically save to local storage after exiting textbox
        });
    });
}

// Automatically save state to local storage after modifying topics
function saveStateAndUpdate() {
    exportToLocal(); // Save state to local storage
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
                saveStateAndUpdate(); // Save state automatically after loading
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

// Automatically save state after selecting a topic
function onTopicChange() {
    restoreState(); // Restore the state based on the selected topic
    saveStateAndUpdate(); // Save state automatically after selecting a topic
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
        saveStateAndUpdate(); // Automatically save after adding a topic
    }
}

// Remove an existing topic
function removeTopic() {
    const selectedTopic = document.getElementById('topicSelect').value;
    topics = topics.filter(topic => topic.topicName !== selectedTopic);
    populateTopicsDropdown();
    saveStateAndUpdate(); // Automatically save after removing a topic
}

// Automatically save state after adding or removing stacked verses
async function addVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const stackedVerses = document.getElementById('stackedVerses');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;
    const selectedSurah = quranMetadata.find(surah => surah.number == selectedChapter);

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse');
        newVerseDiv.innerHTML = `
            <strong>سورة ${selectedSurah.number}: ${selectedSurah.name.ar} (آية ${selectedVerse})</strong><br>
            ${verseData.text.ar}
            <br>
            <button onclick="removeVerse(this)">إزالة</button>
            <button onclick="selectStackedVerse(${selectedChapter}, ${selectedVerse})">عرض</button>
            <button onclick="moveVerseUp(this)">أعلى</button>
            <button onclick="moveVerseDown(this)">أسفل</button>
        `;

        const notesTextArea = document.createElement('textarea');
        notesTextArea.placeholder = "أدخل سبب إستعمال هذه الآية";
        notesTextArea.rows = 3;
        notesTextArea.style.width = '100%';

        newVerseDiv.appendChild(notesTextArea);

        const dashedLine = document.createElement('hr');
        dashedLine.classList.add('dashed-line');

        stackedVerses.appendChild(newVerseDiv);
        stackedVerses.appendChild(dashedLine);

        saveStateAndUpdate(); // Automatically save after adding a verse
    }
}

// Automatically save after removing a stacked verse
function removeVerse(button) {
    const verseDiv = button.parentElement;
    const dashedLine = verseDiv.nextElementSibling;

    // Remove both the verse div and its dashed line
    verseDiv.remove();
    if (dashedLine && dashedLine.classList.contains('dashed-line')) {
        dashedLine.remove();
    }

    saveStateAndUpdate(); // Automatically save after removing a verse
}

// Automatically save state after moving verses up or down
function moveVerseUp(button) {
    const verseDiv = button.parentElement;
    const dashedLine = verseDiv.nextElementSibling;
    const previousVerseDiv = verseDiv.previousElementSibling?.previousElementSibling;

    if (previousVerseDiv) {
        verseDiv.parentElement.insertBefore(verseDiv, previousVerseDiv);
        dashedLine.parentElement.insertBefore(dashedLine, verseDiv);
    }

    saveStateAndUpdate(); // Automatically save after moving verse up
}

function moveVerseDown(button) {
    const verseDiv = button.parentElement;
    const dashedLine = verseDiv.nextElementSibling;
    const nextVerseDiv = dashedLine?.nextElementSibling;

    if (nextVerseDiv && nextVerseDiv.classList.contains('verse')) {
        verseDiv.parentElement.insertBefore(verseDiv, nextVerseDiv.nextElementSibling);
        dashedLine.parentElement.insertBefore(dashedLine, nextVerseDiv.nextElementSibling);
    }

    saveStateAndUpdate(); // Automatically save after moving verse down
}
