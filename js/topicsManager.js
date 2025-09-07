// Global state
let topicName = "";
let topicIntro = "";
let topicVerses = []; // Array of { surahNumber, verseNumber, verseNotes }


document.getElementById('topicSelect').addEventListener('input', e => {
    topicName = e.target.value;
    saveStateToLocal();
});

document.getElementById('topicIntro').addEventListener('input', e => {
    topicIntro = e.target.value;
    saveStateToLocal();
});

function addCurrentVerse() {
    const chapterNumberLoc = document.getElementById('chapterSelect').value;
    const verseNumberLoc = document.getElementById('verseSelect').value;
    addVerse(chapterNumberLoc, verseNumberLoc);
}


async function addVerse(chapterNumberLoc, verseNumberLoc) {
    const selectedChapter = chapterNumberLoc;
    const selectedChapterVerseCount = await fetchSurahVersesNumber(chapterNumberLoc);
    const selectedVerse = verseNumberLoc;
    const stackedVerses = document.getElementById('stackedVerses');
    // Scroll topic results container to top
    const topicResults2 = document.getElementById('topicResults2Id');
    if (topicResults2) topicResults2.scrollTop = 0;

    const match = csvData.find(entry =>
        entry.chapter === String(chapterNumberLoc) &&
        entry.verse === String(verseNumberLoc)
    );

    const newVerseDiv = document.createElement('div');
    newVerseDiv.classList.add('verse-container');
    newVerseDiv.dataset.originalVerse = verseNumberLoc; // ✅ STORE HERE

    newVerseDiv.innerHTML = `
        <strong>
           سورة ${chapterNumberLoc}. ${match.chapterName} :
            آية 
        <input type="number" value="${verseNumberLoc}" min="1" max="${verseNumberLoc}" class="verse-number-input" style="width: 5ch; text-align: center;" onchange="updateStackedVerse(event)"> -
        <input type="number" value="${verseNumberLoc}" min="${verseNumberLoc}" max="${selectedChapterVerseCount}" class="verse-number-input" style="width: 5ch; text-align: center;" onchange="updateStackedVerse(event)">
        </strong>
        <br>
        <br>
        <div class="verse-text" data-original="true" data-original-verse="${verseNumberLoc}">
        <strong>${verseNumberLoc}. ${match.text}</strong>
        </div>
        <br>
        <div class="verse-actions">
        <button onclick="selectThisVerseAndScrollMid(${chapterNumberLoc}, ${verseNumberLoc})"><img src="assets/book-open.svg" alt="book"></button>
        <button onclick="moveVerseUp(this)"><img src="assets/arrow-turn-up.svg" alt="up"></button>
        <button onclick="moveVerseDown(this)"><img src="assets/arrow-turn-down.svg" alt="down"></button>
        <button onclick="removeVerse(this)"><img src="assets/x.svg" alt="x"></button>
        </div>
    `;

    // Optional: add notes box
    const notesTextArea = document.createElement('textarea');
    notesTextArea.placeholder = "ملاحظات ...";
    notesTextArea.rows = 3;
    notesTextArea.style.width = '95%';

    const verseObj = {
    surahNumber: selectedChapter,
    verseOrig: selectedVerse,  // ✅ NEW
    verseStart: selectedVerse,
    verseEnd: selectedVerse,
    verseNotes: ""
    };

    topicVerses.push(verseObj);
    notesTextArea.verseData = verseObj;

    notesTextArea.addEventListener('input', function () {
        this.verseData.verseNotes = this.value;
        saveStateToLocal();
    });

    newVerseDiv.appendChild(notesTextArea);
    stackedVerses.insertBefore(newVerseDiv, stackedVerses.firstChild);


    // ✅ Highlight the newly added verse in yellow
    newVerseDiv.style.backgroundColor = 'lightblue';

    // ✅ After 3 seconds, remove the inline style to restore class default
    setTimeout(() => {
        newVerseDiv.style.backgroundColor = '';
    }, 1000);

    saveStateToLocal();
}

function updateStackedVerse(event) {
    const input = event.target;
    const container = input.closest('.verse-container');
    const inputs = container.querySelectorAll('.verse-number-input');
    const verseTextDiv = container.querySelector('.verse-text');

    if (inputs.length < 2 || !verseTextDiv) return;


    const start = parseInt(inputs[0].value);
    const end = parseInt(inputs[1].value);

    // ✅ Sync to verseData inside textarea
    const textarea = container.querySelector('textarea');
    if (textarea && textarea.verseData) {
        textarea.verseData.verseStart = start;
        textarea.verseData.verseEnd = end;
        saveStateToLocal();
    }

    const chapterTitle = container.querySelector('strong')?.textContent || '';
    // Match "سورة {number}.{name} :"
    const chapterMatch = chapterTitle.match(/سورة\s+(\d+)\.(.+?)\s*:/);
    const chapterNumberParsed = chapterMatch ? chapterMatch[1].trim() : null;
    const chapterName = chapterMatch ? chapterMatch[2].trim() : null;

    if (!chapterName) {
        verseTextDiv.textContent = '❌ اسم السورة غير صالح';
        return;
    }

    const chapterEntry = csvData.find(e => e.chapterName === chapterName);
    if (!chapterEntry) {
        verseTextDiv.textContent = '❌ لم يتم العثور على السورة';
        return;
    }

    const chapterNumber = chapterEntry.chapter;
    const originalVerse = parseInt(container.dataset.originalVerse); // ✅ SAFE AND PERSISTENT

    if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) {
        verseTextDiv.textContent = '❌ نطاق غير صالح';
        return;
    }

    const verses = csvData.filter(entry =>
        entry.chapter === String(chapterNumber) &&
        entry.verse >= start &&
        entry.verse <= end
    );

    if (verses.length === 0) {
        verseTextDiv.textContent = '❌ لا توجد آيات في هذا النطاق';
        return;
    }

    const verseHTML = verses.map(v => {
        const isOriginal = parseInt(v.verse) === originalVerse;
        return isOriginal
        ? `<strong>${v.verse}. ${v.text}</strong>`
        : `<span>${v.verse}. ${v.text}</span>`;
    }).join('<br><br>');

    verseTextDiv.innerHTML = verseHTML;


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

