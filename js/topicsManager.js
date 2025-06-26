// Global state
let topicName = "";
let topicVerses = []; // Array of { surahNumber, verseNumber, verseNotes }


document.getElementById('topicSelect').addEventListener('input', e => {
    topicName = e.target.value;
    saveStateToLocal();
});

function addCurrentVerse() {
    const topicResults2 = document.getElementById('topicResults2Id').scrollTop = 0;
    const chapterNumberLoc = document.getElementById('chapterSelect').value;
    const verseNumberLoc = document.getElementById('verseSelect').value;
    addVerse(chapterNumberLoc, verseNumberLoc);
    showMobileColumn('topicColoumn');
}


async function addVerse(chapterNumberLoc, verseNumberLoc) {
    const selectedChapter = chapterNumberLoc;
    const selectedVerse = verseNumberLoc;
    const stackedVerses = document.getElementById('stackedVerses');

  const match = csvData.find(entry =>
    entry.chapter === String(chapterNumberLoc) &&
    entry.verse === String(verseNumberLoc)
);    

        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse-container');
        newVerseDiv.innerHTML = `
            <strong>سورة ${match.chapterName} : آية ${match.verse}</strong><br>
            ${match.text}
            <br>
            <button onclick="moveVerseUp(this)">&uarr;</button>
            <button onclick="moveVerseDown(this)">&darr;</button>
            <button onclick="removeVerse(this)">إزالة</button>
            <button onclick="selectThisVerse(${selectedChapter}, ${selectedVerse})">عرض</button>
        `;

        const notesTextArea = document.createElement('textarea');
        notesTextArea.placeholder = "ملاحظات ...";
        notesTextArea.rows = 3;
        notesTextArea.style.width = '100%';

        const verseObj = { surahNumber: selectedChapter, verseNumber: selectedVerse, verseNotes: "" };
        topicVerses.push(verseObj);

        // Attach the verseObj directly to the textarea
        notesTextArea.verseData = verseObj;

        notesTextArea.addEventListener('input', function () {
            this.verseData.verseNotes = this.value;
            saveStateToLocal();
        });

        newVerseDiv.appendChild(notesTextArea);
        stackedVerses.insertBefore(newVerseDiv, stackedVerses.firstChild);

        saveStateToLocal();
}


function moveVerseUp(button) {
    const verseDiv = button.closest('.verse-container');
    const siblings = [...verseDiv.parentNode.children];
    const index = siblings.indexOf(verseDiv);
    if (index > 0) {
        verseDiv.parentNode.insertBefore(verseDiv, siblings[index - 1]);
        [topicVerses[index], topicVerses[index - 1]] = [topicVerses[index - 1], topicVerses[index]];
        saveStateToLocal();
    }
}

function moveVerseDown(button) {
    const verseDiv = button.closest('.verse-container');
    const siblings = [...verseDiv.parentNode.children];
    const index = siblings.indexOf(verseDiv);
    if (index < siblings.length - 1) {
        verseDiv.parentNode.insertBefore(siblings[index + 1], verseDiv);
        [topicVerses[index], topicVerses[index + 1]] = [topicVerses[index + 1], topicVerses[index]];
        saveStateToLocal();
    }
}

function removeVerse(button) {
    const verseDiv = button.closest('.verse-container');
    const index = [...verseDiv.parentNode.children].indexOf(verseDiv);
    if (index !== -1) {
        topicVerses.splice(index, 1);
        saveStateToLocal();
    }
    verseDiv.remove();
}


async function importTemplateTopic() {
    try {
        const response = await fetch('stored/all.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update global variables
        topicName = data.topicName || '';
        topicVerses = data.topicVerses || [];

        // Clear stacked verses
        const stackedVerses = document.getElementById('stackedVerses');
        stackedVerses.innerHTML = '';
        topicVerses = [];

        // Set UI fields
        document.getElementById('topicSelect').value = topicName;

        // Add verses (in reverse to keep display order)
        for (const verseData of [...data.topicVerses].reverse()) {
            await addVerse(verseData.surahNumber, verseData.verseNumber);

            const stackedChildren = stackedVerses.querySelectorAll('.verse-container textarea');
            if (stackedChildren.length > 0) {
                stackedChildren[0].value = verseData.verseNotes || '';
                if (stackedChildren[0].verseData) {
                    stackedChildren[0].verseData.verseNotes = verseData.verseNotes || '';
                }
            }
        }

    } catch (err) {
        console.error('[importTemplateTopic] Failed to load template topic:', err);
        alert('فشل في تحميل المثال: ' + err.message);
    }
}

