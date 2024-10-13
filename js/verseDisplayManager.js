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

// Fetch a specific analysis for a verse (individual fetch)
async function fetchAnalysis(chapterNumber, verseNumber, source) {
    try {
        const filePath = `data/tafseer/${source}/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`;
        console.log(`Fetching analysis from: ${filePath}`); // Debugging line

        const response = await fetch(filePath);
        if (response.ok) {
            const analysisData = await response.json();
            console.log(`Fetched data for ${source}:`, analysisData); // Debugging line
            return analysisData.text || `لا يوجد مدخل لهذه الآية`;
        } else {
            console.error(`Failed to fetch ${source} analysis for ${chapterNumber}:${verseNumber}`);
            return `No ${source} analysis available`;
        }
    } catch (error) {
        console.error(`Error fetching ${source}:`, error);
        return `No ${source} analysis available`;
    }
}


async function fetchVerseWithAnalyses(chapterNumber, verseNumber) {
    try {
        showLoadingStatus(`Loading verse ${verseNumber} of chapter ${chapterNumber}`);
        
        // Fetch the main verse data
        const response = await fetch(`data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`);
        if (!response.ok) {
            throw new Error('Verse file not found');
        }
        const verseData = await response.json();

        const sources = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];
        
        // Fetch selected analyses and log their status
        const selectedSources = sources.filter(source => {
            const checkbox = document.getElementById(`toggle${source}`);
            if (!checkbox) {
                console.warn(`Checkbox not found for: ${source}`);
            } else {
                console.log(`Checkbox for ${source}: ${checkbox.checked}`);
            }
            return checkbox ? checkbox.checked : false;
        });

        // Fetch analyses in parallel using Promise.all
        const fetchPromises = selectedSources.map(source => fetchAnalysis(chapterNumber, verseNumber, source));
        const analysesResults = await Promise.all(fetchPromises);

        const analyses = selectedSources.reduce((acc, source, index) => {
            acc[source] = analysesResults[index];
            return acc;
        }, {});

        hideLoadingStatus();

        return {
            verseData,
            analyses
        };
    } catch (error) {
        hideLoadingStatus();
        console.error(error);
        return null;
    }
}


// Display the verse and analyses
async function displayVerseWithAnalyses() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);
    console.log('Fetched verse with analyses:', verseWithAnalyses); // Debugging line

    if (verseWithAnalyses) {
        let displayContent = '<hr class="dashed-line">';

        // Always display the main verse text
        displayContent += `<strong>النص</strong><br><br><div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><br><hr class="dashed-line">`;

        const analysesToShow = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];
        const analysesName = ['المعاني', 'الإعراب', 'البغوي', 'ابن كثير', 'القرطبي', 'السعدي', 'الطبري', 'الوسيط', 'الميسر', 'التنوير'];

        analysesToShow.forEach((analysisType, index) => {
            const checkbox = document.getElementById(`toggle${analysisType}`);
            if (checkbox && checkbox.checked) {
                const lowerCaseKey = analysisType.toLowerCase(); // Convert analysisType to lowercase
                console.log(`Displaying analysis for: ${analysisType}`, verseWithAnalyses.analyses[lowerCaseKey]); // Debugging line

                // Use the lowercase key to access the analysis data
                const analysisContent = verseWithAnalyses.analyses[lowerCaseKey];
                displayContent += `<strong>${analysesName[index]}:</strong><br><br><div class="rtl-text">${analysisContent || 'لا يوجد مدخل لهذه الآية'}</div><br><hr class="dashed-line">`;
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
                svgElement.style.width = '125%'; // Set SVG to fit the container width
                svgElement.style.height = 'auto'; // Maintain aspect ratio

                // Highlight the selected verse
                const verseElement = svgElement.getElementById(`verse-${selectedVerse}`);
                if (verseElement) {
                    verseElement.setAttribute("style", "fill: blue;");
                }

                const currentPageContainer = document.getElementById('currentPage');
                currentPageContainer.innerHTML = ''; // Clear current content
                currentPageContainer.appendChild(svgElement);
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
}

// Helper function to pad numbers with leading zeros
function padNumber(num) {
    return String(num).padStart(3, '0');
}
