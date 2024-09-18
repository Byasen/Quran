// Fetch a specific verse, including its meaning from ar_ma3any.json and grammar analysis from e3rab.json
async function fetchVerseWithMeaningAndGrammar(chapterNumber, verseNumber) {
    try {
        // Fetch the verse as usual
        const response = await fetch(`data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`);
        if (!response.ok) {
            throw new Error('Verse file not found');
        }
        const verseData = await response.json();

        // Fetch the meaning from ar_ma3any.json
        const meaningResponse = await fetch('data/maany/ar_ma3any.json');
        if (!meaningResponse.ok) {
            throw new Error('Meaning file not found');
        }
        const meanings = await meaningResponse.json();

        // Fetch the grammar analysis from e3rab.json
        const e3rabResponse = await fetch('data/eaarab/e3rab.json');
        if (!e3rabResponse.ok) {
            throw new Error('Grammar file not found');
        }
        const e3rab = await e3rabResponse.json();

        // Find the corresponding meaning for this verse
        const verseMeaning = meanings.find(
            meaning => meaning.sura == chapterNumber && meaning.aya == verseNumber
        );

        // Find the corresponding grammar analysis for this verse
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
        // Fetch the states of the checkboxes
        const showArabic = document.getElementById('toggleArabic').checked;
        const showEnglish = document.getElementById('toggleEnglish').checked;
        const showMeaning = document.getElementById('toggleMeaning').checked;
        const showGrammar = document.getElementById('toggleGrammar').checked;

        // Build the display content based on which checkboxes are checked
        let displayContent = '';

        if (showArabic) {
            displayContent += `<strong>Arabic:</strong> ${verseWithMeaningAndGrammar.verseData.text.ar}<br>`;
        }

        if (showEnglish) {
            displayContent += `<strong>English:</strong> ${verseWithMeaningAndGrammar.verseData.text.en}<br>`;
        }

        if (showMeaning) {
            displayContent += `<strong>Meaning:</strong> ${verseWithMeaningAndGrammar.meaningText}<br>`;
        }

        if (showGrammar) {
            displayContent += `<strong>Grammar Analysis:</strong> ${verseWithMeaningAndGrammar.grammarText}<br>`;
        }

        // Update the verse display
        verseDisplay.innerHTML = displayContent || 'No content selected.';

        // Display the corresponding Quran pages based on the page number in the JSON and highlight the selected verse
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

                // Find the verse element inside the SVG and highlight it
                const verseElement = svgElement.getElementById(`verse-${selectedVerse}`);
                if (verseElement) {
                    verseElement.setAttribute("style", "fill: blue;"); // Apply blue color to the verse text
                }

                const currentPageContainer = document.getElementById('currentPage');
                currentPageContainer.innerHTML = ''; // Clear the previous content
                currentPageContainer.appendChild(svgElement); // Append the modified SVG
            });

        // Load the previous and next pages as normal
        displayPreviousNextPages(pageNumber);
    } else {
        const currentPageContainer = document.getElementById('currentPage');
        currentPageContainer.innerHTML = `<p>Page not found for this verse.</p>`;
    }
}

// Function to display the previous and next Quran pages (SVG)
function displayPreviousNextPages(pageNumber) {
    const previousPagePath = `data/SVG/${padNumber(pageNumber - 1)}.svg`;
    const previousPageContainer = document.getElementById('previousPage');
    if (pageNumber > 1) {
        previousPageContainer.innerHTML = `<img src="${previousPagePath}" alt="Quran Page ${pageNumber - 1}" style="max-width: 100%; height: auto;">`;
    } else {
        previousPageContainer.innerHTML = `<p>No previous page</p>`;
    }

    const nextPagePath = `data/SVG/${padNumber(pageNumber + 1)}.svg`;
    const nextPageContainer = document.getElementById('nextPage');
    nextPageContainer.innerHTML = `<img src="${nextPagePath}" alt="Quran Page ${pageNumber + 1}" style="max-width: 100%; height: auto;">`;
}
