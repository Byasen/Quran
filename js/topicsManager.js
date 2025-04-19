// Global state
let topicName = "";
let topicAnswer = "";
let topicVerses = []; // Array of { surahNumber, verseNumber, verseNotes }

// Immediately attach listeners (no function wrapping)
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('topicSelect');
    const answerInput = document.getElementById('answerInput');

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            topicName = nameInput.value;
        });
    }

    if (answerInput) {
        answerInput.addEventListener('input', () => {
            topicAnswer = answerInput.value;
        });
    }
});

// Add the selected verse to the stacked section
async function addVerse(chapterNumberLoc, verseNumberLoc) {
    const selectedChapter = chapterNumberLoc;
    const selectedVerse = verseNumberLoc;
    const selectedSurah = quranMetadata.find(surah => surah.number == selectedChapter);
    const stackedVerses = document.getElementById('stackedVerses');

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        const cleanText = verseData.text.ar.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '');

        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse-container');
        newVerseDiv.innerHTML = `
            <strong>سورة ${selectedSurah.number}: ${selectedSurah.name.ar} (آية ${selectedVerse})</strong><br>
            ${cleanText}
            <br>
            <button onclick="moveVerseUp(this)">رتب لأعلى</button>
            <button onclick="moveVerseDown(this)">رتب لأسفل</button>
            <button onclick="removeVerse(this)">إزالة</button>
            <button onclick="selectThisVerse(${selectedChapter}, ${selectedVerse})">اختيار</button>
        `;

        const notesTextArea = document.createElement('textarea');
        notesTextArea.placeholder = "أدخل سبب إستعمال هذه الآية";
        notesTextArea.rows = 3;
        notesTextArea.style.width = '100%';

        // Track this verse and its notes in global array
        const verseEntry = {
            surahNumber: parseInt(selectedChapter),
            verseNumber: parseInt(selectedVerse),
            verseNotes: ""
        };

        notesTextArea.addEventListener('input', () => {
            verseEntry.verseNotes = notesTextArea.value;
        });

        newVerseDiv.appendChild(notesTextArea);
        stackedVerses.insertBefore(newVerseDiv, stackedVerses.firstChild);
        topicVerses.unshift(verseEntry);
    }
}

function addCurrentVerse() {
    const chapterNumberLoc = document.getElementById('chapterSelect').value;
    const verseNumberLoc = document.getElementById('verseSelect').value;
    addVerse(chapterNumberLoc, verseNumberLoc);
}

function removeVerse(button) {
    const verseDiv = button.parentElement;
    const index = Array.from(verseDiv.parentNode.children).indexOf(verseDiv);

    verseDiv.remove();
    topicVerses.splice(index, 1);
}

function moveVerseUp(button) {
    const currentVerse = button.closest('.verse-container');
    const currentIndex = Array.from(currentVerse.parentNode.children).indexOf(currentVerse);
    
    if (currentIndex > 0) {
        // Swap the positions in topicVerses array
        [topicVerses[currentIndex], topicVerses[currentIndex - 1]] = [topicVerses[currentIndex - 1], topicVerses[currentIndex]];
        
        // Move the verse in the DOM
        currentVerse.parentNode.insertBefore(currentVerse, currentVerse.previousElementSibling);
    }
}

function moveVerseDown(button) {
    const currentVerse = button.closest('.verse-container');
    const currentIndex = Array.from(currentVerse.parentNode.children).indexOf(currentVerse);
    
    if (currentIndex < currentVerse.parentNode.children.length - 1) {
        // Swap the positions in topicVerses array
        [topicVerses[currentIndex], topicVerses[currentIndex + 1]] = [topicVerses[currentIndex + 1], topicVerses[currentIndex]];
        
        // Move the verse in the DOM
        currentVerse.parentNode.insertBefore(currentVerse.nextElementSibling, currentVerse);
    }
}

