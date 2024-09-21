// Fetch a specific verse, including its ma3any from ar_ma3any.json and e3rab analysis from e3rab.json
async function fetchVerseWithAnalyses(chapterNumber, verseNumber) {
    try {
        const response = await fetch(`data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`);
        if (!response.ok) {
            throw new Error('Verse file not found');
        }
        const verseData = await response.json();

        const analyses = {};

        const sources = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];

        for (let source of sources) {
            const sourceResponse = await fetch(`data/tafseer/${source}.json`);
            if (sourceResponse.ok) {
                const analysisData = await sourceResponse.json();
                analyses[source] = analysisData.find(item => item.sura == chapterNumber && item.aya == verseNumber)?.text || `No ${source} analysis available`;
            } else {
                analyses[source] = `No ${source} analysis available`;
            }
        }

        return {
            verseData,
            analyses
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Display the verse, its ma3any, and its e3rab analysis in the UI
async function displayVerseWithAnalyses() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);
    if (verseWithAnalyses) {
        let displayContent = '<hr class="dashed-line">'; // Start with a dashed line

        if (document.getElementById('toggleArabic').checked) {
            displayContent += `<strong>Arabic:</strong><br><div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><br><hr class="dashed-line">`;
        }

        const analysesToShow = ['ma3any', 'e3rab', 'Baghawy', 'Katheer', 'Qortoby', 'Sa3dy', 'Tabary', 'Waseet', 'Muyassar', 'Tanweer'];

        analysesToShow.forEach(analysisType => {
            if (document.getElementById(`toggle${analysisType}`).checked) {
                displayContent += `<strong>${analysisType}:</strong><br><div class="rtl-text">${verseWithAnalyses.analyses[analysisType.toLowerCase()]}</div><br><hr class="dashed-line">`;
            }
        });

        verseDisplay.innerHTML = displayContent || 'No content selected.';
        displayQuranPagesWithHighlight(verseWithAnalyses.verseData.page, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse or analyses not available.';
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

        // Reverse the order: show Current+1 on the left, Current in the center, and Current-1 on the right
        displayNextPreviousPages(pageNumber);
    } else {
        const currentPageContainer = document.getElementById('currentPage');
        currentPageContainer.innerHTML = `<p>Page not found for this verse.</p>`;
    }
}

// Function to display the next and previous Quran pages (SVG) in reversed order
function displayNextPreviousPages(pageNumber) {
    const nextPagePath = `data/SVG/${padNumber(pageNumber + 1)}.svg`;
    const previousPagePath = `data/SVG/${padNumber(pageNumber - 1)}.svg`;

    const previousPageContainer = document.getElementById('previousPage');
    const nextPageContainer = document.getElementById('nextPage');

    // Display Current+1 (next) on the left
    nextPageContainer.innerHTML = `<img src="${nextPagePath}" alt="Quran Page ${pageNumber + 1}" style="max-width: 100%; height: auto;">`;

    // Display Current-1 (previous) on the right
    if (pageNumber > 1) {
        previousPageContainer.innerHTML = `<img src="${previousPagePath}" alt="Quran Page ${pageNumber - 1}" style="max-width: 100%; height: auto;">`;
    } else {
        previousPageContainer.innerHTML = `<p>No previous page</p>`;
    }
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
