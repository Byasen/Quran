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

        let displayContent = '<hr class="dashed-line">'; // Start with a dashed line

        if (showArabic) {
            displayContent += `<strong>Arabic:</strong><br>${verseWithMeaningAndGrammar.verseData.text.ar}<br><hr class="dashed-line">`;
        }

        if (showEnglish) {
            displayContent += `<strong>English:</strong><br>${verseWithMeaningAndGrammar.verseData.text.en}<br><hr class="dashed-line">`;
        }

        if (showMeaning) {
            displayContent += `<strong>Meaning:</strong><br>${verseWithMeaningAndGrammar.meaningText}<br><hr class="dashed-line">`;
        }

        if (showGrammar) {
            displayContent += `<strong>Grammar Analysis:</strong><br>${verseWithMeaningAndGrammar.grammarText}<br><hr class="dashed-line">`;
        }

        verseDisplay.innerHTML = displayContent || 'No content selected.';
        displayQuranPagesWithHighlight(verseWithMeaningAndGrammar.verseData.page, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse, meaning, or grammar analysis not available.';
    }
}

// Function to display the corresponding Quran pages (SVG) and highlight the selected verse
function displayQuranPagesWithHighlight(pageNumber, selectedVerse) {
    if (pageNumber) {
        const currentPagePath = `data/SVG/${padNumber(pageNumber)}.svg`;
        fetch(currentPagePath)
            .then(response => response.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                const svgElement = svgDoc.documentElement;

                svgElement.setAttribute('data-page-number', pageNumber);

                const verseElement = svgElement.getElementById(`verse-${selectedVerse}`);
                if (verseElement) {
                    verseElement.setAttribute("style", "fill: blue;");
                }

                const currentPageContainer = document.getElementById('currentPage');
                currentPageContainer.innerHTML = '';
                currentPageContainer.appendChild(svgElement);
            });

        displayPreviousNextPages(pageNumber);
    } else {
        const currentPageContainer = document.getElementById('currentPage');
        currentPageContainer.innerHTML = `<p>Page not found for this verse.</p>`;
    }
}

// Function to display the previous and next Quran pages (SVG)
function displayPreviousNextPages(pageNumber) {
    const previousPagePath = `data/SVG/${padNumber(pageNumber - 1)}.svg`;
    const nextPagePath = `data/SVG/${padNumber(pageNumber + 1)}.svg`;

    const previousPageContainer = document.getElementById('previousPage');
    const nextPageContainer = document.getElementById('nextPage');

    if (pageNumber > 1) {
        previousPageContainer.innerHTML = `<img src="${previousPagePath}" alt="Quran Page ${pageNumber - 1}" style="max-width: 100%; height: auto;">`;
    } else {
        previousPageContainer.innerHTML = `<p>No previous page</p>`;
    }

    nextPageContainer.innerHTML = `<img src="${nextPagePath}" alt="Quran Page ${pageNumber + 1}" style="max-width: 100%; height: auto;">`;
}

// Function to hide Quran pages
function hideVerse() {
    const nextPageContainer = document.getElementById('nextPage');
    const currentPageContainer = document.getElementById('currentPage');
    const previousPageContainer = document.getElementById('previousPage');

    nextPageContainer.innerHTML = '';
    currentPageContainer.innerHTML = '';
    previousPageContainer.innerHTML = '';
}
