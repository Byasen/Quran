// Save the current state and display JSON in a new tab
function saveState() {
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

    const userInput = document.getElementById('userInput').value;

    const fullState = {
        verses: state,
        userInput: userInput
    };

    const jsonData = JSON.stringify(fullState, null, 2);
    const newTab = window.open();
    newTab.document.write(`<pre>${jsonData}</pre>`);
    newTab.document.title = 'Quran State JSON';
}

// Restore the saved state (for the verses only)
async function restoreState(state) {
    if (state && Array.isArray(state)) {
        document.getElementById('stackedVerses').innerHTML = '';

        for (const { surahNumber, verseNumber, verseNotes } of state) {
            document.getElementById('chapterSelect').value = surahNumber;
            await fetchSurahVerses(surahNumber);
            document.getElementById('verseSelect').value = verseNumber;
            await addVerse();

            const stackedVerses = document.getElementById('stackedVerses').children;
            const lastVerseDiv = stackedVerses[stackedVerses.length - 2];
            const textArea = lastVerseDiv.querySelector('textarea');
            if (textArea) {
                textArea.value = verseNotes || "";
            }
        }
    } else {
        console.error("Invalid state structure:", state);
    }
}
