function saveState() {
    // Log the loaded data for debugging
    return JSON.stringify({
        topicName,
        topicAnswer,
        topicVerses,
        currentSearchInput,
        checkedWords
    }, null, 2);
    
}


function loadState(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // Update global variables
        topicName = data.topicName || '';
        topicAnswer = data.topicAnswer || '';
        topicVerses = data.topicVerses || [];
        currentSearchInput = data.currentSearchInput || '';  // Use the global variable for the search term
        checkedWords = data.checkedWords || [];


        // Set the UI elements based on the loaded data
        document.getElementById('topicSelect').value = topicName;
        document.getElementById('answerInput').value = topicAnswer;

        // After updating the checkboxes, trigger the search for the word
        let field = document.getElementById("verseSearchInput");
        if (field && currentSearchInput) {
            field.value = currentSearchInput;  // Set the search field value
            searchInCSV();  // Trigger the search function
        }

        checkedWords.forEach(query => {
            const mainCheckbox = document.getElementById(`searchWord-${query}`);
            if (mainCheckbox) {
            mainCheckbox.checked = true;
            }
        });


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
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear existing data
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
