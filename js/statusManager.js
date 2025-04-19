// Save state to JSON file with topicName and timestamp
function saveStateToFile() {
    const data = {
        topicName,
        topicAnswer,
        topicVerses
    };

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `_[${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${pad(now.getFullYear() % 100)}]-[${pad(now.getHours())}-${pad(now.getMinutes())}]`;

    // Include topic name and timestamp in filename
    a.href = url;
    a.download = `${topicName}${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Load state from JSON file
function loadStateFromFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        
        if (file && file.name.endsWith('.json')) {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const data = JSON.parse(e.target.result);

                    // Update global variables with loaded data
                    topicName = data.topicName || '';
                    topicAnswer = data.topicAnswer || '';
                    topicVerses = data.topicVerses || [];

                    // Update the UI based on loaded data
                    document.getElementById('topicSelect').value = topicName;
                    document.getElementById('answerInput').value = topicAnswer;

                    // Clear the existing verses in the UI
                    const stackedVerses = document.getElementById('stackedVerses');
                    stackedVerses.innerHTML = ''; // Clear existing verses

                    // Add verses back in the loaded order
                    topicVerses.forEach((verseData) => {
                        const { surahNumber, verseNumber, verseNotes } = verseData;
                        const selectedSurah = quranMetadata.find(surah => surah.number == surahNumber);

                        // Fetch the verse text (Quranic text)
                        fetchVerse(surahNumber, verseNumber).then((verseData) => {
                            const cleanText = verseData ? verseData.text.ar.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '') : 'Verse not found';

                            const newVerseDiv = document.createElement('div');
                            newVerseDiv.classList.add('verse-container');
                            newVerseDiv.innerHTML = `
                                <strong>سورة ${selectedSurah.number}: ${selectedSurah.name.ar} (آية ${verseNumber})</strong><br>
                                ${cleanText} <!-- Verse Text -->
                                <br>
                                <button onclick="moveVerseUp(this)">رتب لأعلى</button>
                                <button onclick="moveVerseDown(this)">رتب لأسفل</button>
                                <button onclick="removeVerse(this)">إزالة</button>
                                <button onclick="selectThisVerse(${surahNumber}, ${verseNumber})">اختيار</button>
                            `;

                            const notesTextArea = document.createElement('textarea');
                            notesTextArea.value = verseNotes || '';  // Set the notes value
                            notesTextArea.placeholder = "أدخل سبب إستعمال هذه الآية";
                            notesTextArea.rows = 3;
                            notesTextArea.style.width = '100%';

                            newVerseDiv.appendChild(notesTextArea);
                            stackedVerses.appendChild(newVerseDiv);
                        });
                    });
                } catch (err) {
                    alert('Error loading file: ' + err.message);
                }
            };

            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file.');
        }
    };

    fileInput.click();
}

