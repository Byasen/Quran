function saveState() {
    const searchTerm = currentSearchInput;  // Using the global variable for the current search term
    
    // Gather all suggested words (from the checkboxes)
    const searchResultsWords = Array.from(checkedWords);
    const checkedSearchWords = Array.from(checkedWords);  // Global checked words

    
    return JSON.stringify({
        topicName,
        topicAnswer,
        topicVerses,
        searchTerm,
        searchResultsWords,
        checkedSearchWords
    }, null, 2);
    
}


function loadState(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        // Update global variables
        topicName = data.topicName || '';
        topicAnswer = data.topicAnswer || '';
        topicVerses = data.topicVerses || [];
        currentSearchInput = data.searchTerm || '';  // Use the global variable for the search term
        const searchResultsWords = data.searchResultsWords || [];
        checkedWords = new Set(data.checkedSearchWords || []);  // Use the global variable for checked words
        uncheckedWords = new Set();  // Reset unchecked words as they are not part of the loaded state

        // Log the loaded data for debugging
        console.log('[loadState] Loaded data:', data);
        console.log('[loadState] Current search input:', currentSearchInput);
        console.log('[loadState] Checked words:', checkedWords);

        // Set the UI elements based on the loaded data
        document.getElementById('topicSelect').value = topicName;
        document.getElementById('answerInput').value = topicAnswer;

        // Restore search input box
        const searchInput = document.getElementById('searchInput');
        if (searchInput && currentSearchInput) {
            searchInput.value = currentSearchInput;
            performSearch(currentSearchInput); // Trigger the search with the loaded term
        }

        // Wait a moment to allow search results to load before updating checkboxes
        setTimeout(() => {
            if (Array.isArray(searchResultsWords)) {
                // Loop through the suggested words and check/uncheck the checkboxes
                searchResultsWords.forEach(word => {
                    const checkbox = document.querySelector(`input[type="checkbox"][data-word="${word}"]`);
                    if (checkbox) {
                        // Check if the word is in the checkedWords set
                        checkbox.checked = checkedWords.has(word);
                        console.log(`[loadState] Checkbox ${word} -> ${checkbox.checked}`);
                    }
                });
            }

            // After updating the checkboxes, trigger the search for the word
            let field = document.getElementById("verseSearchInput");
            if (field && currentSearchInput) {
                field.value = currentSearchInput;  // Set the search field value
                searchInCSV();  // Trigger the search function
            }
        }, 500); // Adjust timing if needed

        // Restore topic verses
        const stackedVerses = document.getElementById('stackedVerses');
        stackedVerses.innerHTML = '';

        topicVerses.forEach((verseData) => {
            const { surahNumber, verseNumber, verseNotes } = verseData;
            const selectedSurah = quranMetadata.find(surah => surah.number == surahNumber);

            fetchVerse(surahNumber, verseNumber).then((verseData) => {
                const cleanText = verseData ? verseData.text.ar.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '') : 'Verse not found';

                const newVerseDiv = document.createElement('div');
                newVerseDiv.classList.add('verse-container');
                newVerseDiv.innerHTML = `
                    <strong>سورة ${selectedSurah.number}: ${selectedSurah.name.ar} (آية ${verseNumber})</strong><br>
                    ${cleanText}
                    <br>
                    <button onclick="moveVerseUp(this)">رتب لأعلى</button>
                    <button onclick="moveVerseDown(this)">رتب لأسفل</button>
                    <button onclick="removeVerse(this)">إزالة</button>
                    <button onclick="selectThisVerse(${surahNumber}, ${verseNumber})">اختيار</button>
                `;

                const notesTextArea = document.createElement('textarea');
                notesTextArea.value = verseNotes || '';
                notesTextArea.placeholder = "أدخل سبب إستعمال هذه الآية";
                notesTextArea.rows = 3;
                notesTextArea.style.width = '100%';

                newVerseDiv.appendChild(notesTextArea);
                stackedVerses.appendChild(newVerseDiv);
            });
        });
    } catch (err) {
        console.error('[loadState] Failed to load topic:', err);
        alert('Failed to load topic: ' + err.message);
    }
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
    const jsonData = saveState();
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonData);
}

async function loadStateFromLocal() {
    const jsonData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (jsonData) {
        loadState(jsonData);
        const randomChapter = Math.floor(Math.random() * 114) + 1;
        const tempPath = `data/surah/surah_${randomChapter}.json`;
        const response = await fetch(tempPath);
        tempSurah = await response.json();
        const tempVerseCount =  tempSurah.verses.length;
        const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
        selectThisVerse(randomChapter, randomVerse);
    } else {
        const randomChapter = Math.floor(Math.random() * 114) + 1;
        const tempPath = `data/surah/surah_${randomChapter}.json`;
        const response = await fetch(tempPath);
        tempSurah = await response.json();
        const tempVerseCount =  tempSurah.verses.length;
        const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
        selectThisVerse(randomChapter, randomVerse);
        selectRandomWordAndSearch();
    }
}
