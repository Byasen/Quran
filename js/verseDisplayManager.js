// Display the selected verse in the upper section
async function displayVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        verseDisplay.innerHTML = `
            <strong>Arabic:</strong> ${verseData.text.ar}<br>
            <strong>English:</strong> ${verseData.text.en}
        `;

        displayQuranPagesWithHighlight(verseData.page, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse not available.';
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
