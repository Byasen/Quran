// Show the loading bar and status
function showLoadingStatus(message) {
    const loadingBar = document.getElementById('loadingBar');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingBarContainer = document.getElementById('loadingBarContainer');

    loadingBarContainer.style.display = 'block';
    loadingStatus.textContent = message;

    // Simulate progress (for demonstration, you can adjust it)
    loadingBar.value += 10;
    if (loadingBar.value > 100) loadingBar.value = 0; // Reset if it exceeds 100
}

// Hide the loading bar once loading is complete
function hideLoadingStatus() {
    const loadingBarContainer = document.getElementById('loadingBarContainer');
    loadingBarContainer.style.display = 'none';
}

// Fetch a specific verse, including its ma3any from ar_ma3any.json and e3rab analysis from e3rab.json
async function fetchVerseWithAnalyses(chapterNumber, verseNumber) {
    try {
        showLoadingStatus(`Loading verse ${verseNumber} of chapter ${chapterNumber}`);

        const response = await fetch(`data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`);
        if (!response.ok) {
            throw new Error('Verse file not found');
        }
        const verseData = await response.json();

        const analyses = {};

        const sources = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];

        for (let source of sources) {
            showLoadingStatus(`Loading ${source} for verse ${verseNumber}`);
            try {
                const filePath = `data/tafseer/${source}/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`;
                const sourceResponse = await fetch(filePath);
                if (sourceResponse.ok) {
                    const analysisData = await sourceResponse.json();
                    analyses[source] = analysisData.text || `لا يوجد مدخل لهذه الآية`;
                } else {
                    analyses[source] = `No ${source} analysis available`;
                }
            } catch (error) {
                console.error(`Error loading ${source}:`, error);
                analyses[source] = `No ${source} analysis available`;
            }
        }

        hideLoadingStatus(); // Hide the loading bar once loading is complete

        return {
            verseData,
            analyses
        };
    } catch (error) {
        hideLoadingStatus(); // Hide the loading bar in case of error
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
        let displayContent = '<hr class="dashed-line">';

        // النص should always be displayed
        displayContent += `<strong>النص</strong><br><br><div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><br><hr class="dashed-line">`;

        const analysesToShow = ['ma3any', 'e3rab', 'Baghawy', 'Katheer', 'Qortoby', 'Sa3dy', 'Tabary', 'Waseet', 'Muyassar', 'Tanweer'];
        const analysesName = ['المعاني', 'الإعراب', 'البغوي', 'ابن كثير', 'القرطبي', 'السعدي', 'الطبري', 'الوسيط', 'الميسر', 'التنوير'];

        analysesToShow.forEach((analysisType, index) => {
            if (document.getElementById(`toggle${analysisType}`).checked) {
                displayContent += `<strong>${analysesName[index]}:</strong><br><br><div class="rtl-text">${verseWithAnalyses.analyses[analysisType.toLowerCase()]}</div><br><hr class="dashed-line">`;
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
        const currentPagePath = `data/svg/${padNumber(pageNumber)}.svg`;

        fetch(currentPagePath)
            .then(response => response.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                const svgElement = svgDoc.documentElement;

                svgElement.setAttribute('data-page-number', pageNumber);
                svgElement.style.width = '100%'; // Set SVG to fit the container width
                svgElement.style.height = 'auto'; // Maintain aspect ratio
                svgElement.style.objectFit = 'contain'; // Fit the SVG within its container

                // Highlight the selected verse
                const verseElement = svgElement.getElementById(`verse-${selectedVerse}`);
                if (verseElement) {
                    verseElement.setAttribute("style", "fill: blue;");
                }

                const currentPageContainer = document.getElementById('currentPage');
                currentPageContainer.innerHTML = ''; // Clear current content
                currentPageContainer.appendChild(svgElement);

                // Set container styles
                currentPageContainer.style.width = '100%';
                currentPageContainer.style.boxSizing = 'border-box';

                // Adjust the heights of all containers after SVG is loaded
                adjustContainerHeights();
            });

        // Display the next and previous pages
        displayNextPreviousPages(pageNumber);
    } else {
        const currentPageContainer = document.getElementById('currentPage');
        currentPageContainer.innerHTML = `<p>Page not found for this verse.</p>`;
    }
}

// Function to display the next and previous Quran pages (SVG) in reversed order
function displayNextPreviousPages(pageNumber) {
    const nextPagePath = `data/svg/${padNumber(pageNumber + 1)}.svg`;
    const previousPagePath = `data/svg/${padNumber(pageNumber - 1)}.svg`;

    const previousPageContainer = document.getElementById('previousPage');
    const nextPageContainer = document.getElementById('nextPage');

    // Display Current+1 (next) on the left
    if (pageNumber < 604) {
        nextPageContainer.innerHTML = `<img src="${nextPagePath}" alt="Quran Page ${pageNumber + 1}" style="width: 100%; height: auto; object-fit: contain; display: block;">`;
    } else {
        nextPageContainer.innerHTML = `<p>No next page</p>`; // Display "No next page" at the end
    }

    // Display Current-1 (previous) on the right
    if (pageNumber > 1) {
        previousPageContainer.innerHTML = `<img src="${previousPagePath}" alt="Quran Page ${pageNumber - 1}" style="width: 100%; height: auto; object-fit: contain; display: block;">`;
    } else {
        previousPageContainer.innerHTML = `<p>No previous page</p>`;
    }

    // Set container styles
    previousPageContainer.style.width = '100%';
    previousPageContainer.style.boxSizing = 'border-box';

    nextPageContainer.style.width = '100%';
    nextPageContainer.style.boxSizing = 'border-box';

    // Adjust the heights of all containers after images are loaded
    adjustContainerHeights();
}

// Function to adjust the heights of all containers based on the tallest element
function adjustContainerHeights() {
    const previousPageContainer = document.getElementById('previousPage');
    const currentPageContainer = document.getElementById('currentPage');
    const nextPageContainer = document.getElementById('nextPage');

    // Get the heights of the content inside each container
    const previousHeight = previousPageContainer.scrollHeight;
    const currentHeight = currentPageContainer.scrollHeight;
    const nextHeight = nextPageContainer.scrollHeight;

    // Find the maximum height
    const maxHeight = Math.max(previousHeight, currentHeight, nextHeight);

    // Set all containers to the maximum height
    previousPageContainer.style.height = `${maxHeight}px`;
    currentPageContainer.style.height = `${maxHeight}px`;
    nextPageContainer.style.height = `${maxHeight}px`;
}
