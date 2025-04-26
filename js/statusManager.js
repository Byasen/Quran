function saveState() {
    return JSON.stringify({
        topicName,
        topicAnswer,
        topicVerses,
        currentSearchInput,
        checkedWords,
        repeat, // save repeat
        silence // save silence (already in ms)
    }, null, 2);
}



async function loadState(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        // Update global variables
        topicName = data.topicName || '';
        topicAnswer = data.topicAnswer || '';
        topicVerses = data.topicVerses || [];
        currentSearchInput = data.currentSearchInput || '';
        checkedWords = data.checkedWords || [];

        // New: Load repeat and silence (with fallback values)
        repeat = data.repeat !== undefined ? data.repeat : 3;
        silence = data.silence !== undefined ? data.silence : 10000;

        // Update dropdowns
        if (document.getElementById('repeatSelect')) {
            document.getElementById('repeatSelect').value = repeat;
        }
        if (document.getElementById('silenceSelect')) {
            document.getElementById('silenceSelect').value = silence / 1000;
        }

        // Clear stacked verses
        const stackedVerses = document.getElementById('stackedVerses');
        stackedVerses.innerHTML = '';
        topicVerses = [];

        // Set UI elements
        document.getElementById('topicSelect').value = topicName;
        document.getElementById('answerInput').value = topicAnswer;

        // Set and trigger search
        let field = document.getElementById("verseSearchInput");
        if (field && currentSearchInput) {
            field.value = currentSearchInput;
            searchInCSV();
        }

        // Add verses using the actual function (in reverse to maintain original order)
        for (const verseData of [...data.topicVerses].reverse()) {
            await addVerse(verseData.surahNumber, verseData.verseNumber);

            // Set the verse note value directly
            const stackedChildren = stackedVerses.querySelectorAll('.verse-container textarea');
            if (stackedChildren.length > 0) {
                stackedChildren[0].value = verseData.verseNotes || '';
                if (stackedChildren[0].verseData) {
                    stackedChildren[0].verseData.verseNotes = verseData.verseNotes || '';
                }
            }
        }

    } catch (err) {
        console.error('[loadState] Failed to load topic:', err);
        alert('Failed to load topic: ' + err.message);
    }

    // Restore current search checkbox
    const observer = new MutationObserver(() => {
        const checkbox = document.getElementById(`rootWord-${currentSearchInput}`);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Recheck all saved word checkboxes
    checkedWords.forEach(word => {
        const checkObserver = new MutationObserver(() => {
            const checkbox = document.getElementById(`rootWord-${word}`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                checkObserver.disconnect();
            }
        });

        checkObserver.observe(document.body, { childList: true, subtree: true });
    });
}




function saveStateToFile() {
    const jsonData = saveState();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `_[${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${pad(now.getFullYear() % 100)}]-[${pad(now.getHours())}-${pad(now.getMinutes())}]`;

    a.href = url;
    a.download = `quran_${topicName || "topic"}${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadStateFromFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                loadState(e.target.result);
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file.');
        }
    };

    fileInput.click();
}

const LOCAL_STORAGE_KEY = 'quranTopicState';

function saveStateToLocal() {
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear existing data
    const jsonData = saveState();
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonData);
}

async function loadStateFromLocal() {
    const jsonData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (jsonData) {
        loadState(jsonData);
        selectRandomVerse();
    } else {
        selectRandomVerse();
        selectRandomWordAndSearch();
    }
}
