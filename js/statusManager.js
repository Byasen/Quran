function saveDisplaySettings() {
    const classes = ['pageColoumn', 'verseColoumn', 'searchColoumn', 'topicColoumn'];
    const displaySettings = {};
  
    classes.forEach(className => {
      const el = document.querySelector(`.${className}`);
      if (el) {
        displaySettings[className] = window.getComputedStyle(el).display;
      }
    });
  
    localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
  }

function saveState() {
    saveDisplaySettings();
    return JSON.stringify({
        topicName,
        topicIntro,
        topicVerses,
        currentSearchInput,
        checkedWords,
        chapterNumberGlobal,
        verseNumberGlobal,
        repeat, // save repeat
        silence, // save silence (already in ms)
        reciter,
        tafseer
    }, null, 2);
}



async function loadState(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        // Update global variables
        topicName = data.topicName || '';
        topicIntro = data.topicIntro || '';
        topicVerses = data.topicVerses || [];
        currentSearchInput = data.currentSearchInput || '';
        checkedWords = data.checkedWords || [];
        chapterNumberGlobal = data.chapterNumberGlobal || '';
        verseNumberGlobal = data.verseNumberGlobal || '';
        selectThisVerse(chapterNumberGlobal, verseNumberGlobal);

        // New: Load repeat and silence (with fallback values)
        repeat = data.repeat !== undefined ? data.repeat : 3;
        silence = data.silence !== undefined ? data.silence : 10000;
        reciter = data.reciter || 'khalifah_alteneagy';

        tafseer = data.tafseer !== undefined ? data.tafseer : "ma3any";
        
        if (document.getElementById('reciter')) document.getElementById('reciter').value = reciter;
        if (document.getElementById('analysisSelect')) document.getElementById('analysisSelect').value = tafseer;

        // Update dropdowns
        if (document.getElementById('repeatSelect')) {
            document.getElementById('repeatSelect').value = repeat;
        }
        if (document.getElementById('silenceSelect')) {
            const silenceSelect = document.getElementById('silenceSelect');
            if (typeof silence === 'string' && silence.endsWith('X')) {
                silenceSelect.value = silence; // Set directly if it's "1X", "2X", etc.
            } else {
                silenceSelect.value = silence / 1000; // Set as seconds otherwise
            }
        }

        // Clear stacked verses
        const stackedVerses = document.getElementById('stackedVerses');
        stackedVerses.innerHTML = '';
        topicVerses = [];

        // Set UI elements
        document.getElementById('topicSelect').value = topicName;
        document.getElementById('topicIntro').value = topicIntro;

        // Set and trigger search
        let field = document.getElementById("verseSearchInput");
        if (field && currentSearchInput) {
            field.value = currentSearchInput;
            searchInCSV();
        }

        // Add verses using the actual function (in reverse to maintain original order)
        for (const verseData of data.topicVerses) {
      await addVerse(verseData.surahNumber, verseData.verseOrig || verseData.verseStart || verseData.verseNumber);


        const stackedChildren = stackedVerses.querySelectorAll('.verse-container');
        const latestContainer = stackedChildren[0];

        if (latestContainer) {
            const inputs = latestContainer.querySelectorAll('.verse-number-input');
            if (inputs.length === 2) {
                inputs[0].value = verseData.verseStart || verseData.verseOrig || verseData.verseNumber;
                inputs[1].value = verseData.verseEnd || verseData.verseOrig || verseData.verseNumber;
                updateStackedVerse({ target: inputs[1] });
            }

            const textarea = latestContainer.querySelector('textarea');
            if (textarea) {
                textarea.value = verseData.verseNotes || '';
                if (textarea.verseData) {
                    textarea.verseData.verseNotes = verseData.verseNotes || '';
                    textarea.verseData.verseOrig = verseData.verseOrig || verseData.verseNumber;
                    textarea.verseData.verseStart = verseData.verseStart || verseData.verseOrig || verseData.verseNumber;
                    textarea.verseData.verseEnd = verseData.verseEnd || verseData.verseOrig || verseData.verseNumber;
                }
            }

            latestContainer.dataset.originalVerse = verseData.verseOrig || verseData.verseNumber;
        }
    }

    } catch (err) {
        console.error('[loadState] Failed to load topic:', err);
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
    a.download = `${topicName || "topic"}${timestamp}.json`;
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
    } else {
        selectRandomVerse();
        selectRandomWordAndSearch();
        selectStartingTopic();
    }
}