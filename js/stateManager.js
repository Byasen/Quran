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

    // Capture content of the main text areas
    const questionInput = document.getElementById('questionInput').value;
    const answerInput = document.getElementById('answerInput').value;

    const fullState = {
        verses: state,
        questionInput: questionInput,
        answerInput: answerInput // Save new text area content
    };

    const jsonData = JSON.stringify(fullState, null, 2);
    const newTab = window.open();
    newTab.document.write(`<pre>${jsonData}</pre>`);
    newTab.document.title = 'Quran State JSON';
}


