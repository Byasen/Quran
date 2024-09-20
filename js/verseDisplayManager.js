// Fetch a specific verse, including its meaning from ar_ma3any.json and grammar analysis from e3rab.json
async function fetchVerseWithMeaningAndGrammar(chapterNumber, verseNumber) {
    try {
        const response = await fetch(`data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`);
        if (!response.ok) {
            throw new Error('Verse file not found');
        }
        const verseData = await response.json();

        const meaningResponse = await fetch('data/maany/ar_ma3any.json');
        if (!meaningResponse.ok) {
            throw new Error('Meaning file not found');
        }
        const meanings = await meaningResponse.json();

        const e3rabResponse = await fetch('data/eaarab/e3rab.json');
        if (!e3rabResponse.ok) {
            throw new Error('Grammar file not found');
        }
        const e3rab = await e3rabResponse.json();

        const verseMeaning = meanings.find(
            meaning => meaning.sura == chapterNumber && meaning.aya == verseNumber
        );

        const verseGrammar = e3rab.find(
            grammar => grammar.sura == chapterNumber && grammar.aya == verseNumber
        );

        return {
            verseData,
            meaningText: verseMeaning ? verseMeaning.text : 'No meaning available',
            grammarText: verseGrammar ? verseGrammar.text : 'No grammar analysis available'
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Display the verse, its meaning, and its grammar analysis in the UI
async function displayVerseWithMeaning() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithMeaningAndGrammar = await fetchVerseWithMeaningAndGrammar(selectedChapter, selectedVerse);
    if (verseWithMeaningAndGrammar) {
        const showArabic = document.getElementById('toggleArabic').checked;
        const showEnglish = document.getElementById('toggleEnglish').checked;
        const showMeaning = document.getElementById('toggleMeaning').checked;
        const showGrammar = document.getElementById('toggleGrammar').checked;

        let displayContent = `<hr class="dashed-line">`; // Dashed line at the top

        if (showArabic) {
            displayContent += `<strong>Arabic:</strong> ${verseWithMeaningAndGrammar.verseData.text.ar}<br>`;
            displayContent += `<hr class="dashed-line">`; // Dashed line after Arabic text
        }

        if (showEnglish) {
            displayContent += `<strong>English:</strong> ${verseWithMeaningAndGrammar.verseData.text.en}<br>`;
            displayContent += `<hr class="dashed-line">`; // Dashed line after English text
        }

        if (showMeaning) {
            displayContent += `<strong>Meaning:</strong> ${verseWithMeaningAndGrammar.meaningText}<br>`;
            displayContent += `<hr class="dashed-line">`; // Dashed line after meaning
        }

        if (showGrammar) {
            displayContent += `<strong>Grammar Analysis:</strong> ${verseWithMeaningAndGrammar.grammarText}<br>`;
            displayContent += `<hr class="dashed-line">`; // Dashed line after grammar analysis
        }

        verseDisplay.innerHTML = displayContent || 'No content selected.';

        displayQuranPagesWithHighlight(verseWithMeaningAndGrammar.verseData.page, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse, meaning, or grammar analysis not available.';
    }
}
