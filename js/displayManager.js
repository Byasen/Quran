const textarea = document.getElementById('topicIntro');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto'; // Reset height
  textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
});

textarea.addEventListener('focus', () => {
  textarea.style.height = 'auto'; // Reset height
  textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
});

// Global cache: { source: { chapterNumber: [availableVerses] } }
const tafseerCache = {};

async function loadAvailableVerses(chapterNumber, source) {
    if (tafseerCache[source]?.[chapterNumber]) {
        return tafseerCache[source][chapterNumber];
    }

    const availableVerses = [];

    // Check up to 300 verses
    const checks = [];
    for (let v = 1; v <= 300; v++) {
        const filePath = `data/tafseer/${source}/${padNumber(chapterNumber)}_${padNumber(v)}.json`;
        // Use HEAD request to check existence without downloading content
        checks.push(
            fetch(filePath, { method: 'HEAD' })
                .then(res => (res.ok ? v : null))
                .catch(() => null)
        );
    }

    const results = await Promise.all(checks);
    results.forEach(v => {
        if (v !== null) availableVerses.push(v);
    });

    // Cache it
    if (!tafseerCache[source]) tafseerCache[source] = {};
    tafseerCache[source][chapterNumber] = availableVerses;

    return availableVerses;
}


async function fetchAnalysis(chapterNumber, verseNumber, source) {
    try {
        const verseNum = Number(verseNumber);
        const availableVerses = await loadAvailableVerses(chapterNumber, source);

        if (availableVerses.length === 0) {
            // no verses at all → fall back to book
            const bookPath = `data/tafseer/${source}/book`;
            const response = await fetch(bookPath);

            if (response.ok) {
                const bookText = await response.text();
                const arabicLines = bookText
                    .split('\n')
                    .filter(line => /^[\u0600-\u06FF]/.test(line.trim()));

                if (arabicLines.length > 0) {
                    return `الكتاب لا يحتوي على تفسير للسورة المطلوبة, قائمة السور في هذا الكتاب : <br><hr class="dashed-line"><br>${arabicLines.join('<br>')}`;
                } else {
                    return "لم يتم العثور على سور مدعومة في هذا الكتاب.";
                }
            }
            return "تعذر تحميل قائمة السور المتوفرة من الكتاب.";
        }

        // Find closest verse ≤ verseNum
        let chosen = availableVerses.filter(v => v <= verseNum).pop();

        if (chosen !== undefined) {
            const filePath = `data/tafseer/${source}/${padNumber(chapterNumber)}_${padNumber(chosen)}.json`;
            const response = await fetch(filePath);
            const analysisData = await response.json();
            const text = analysisData.text || ``;

            if (chosen !== verseNum) {
                return `لا يوجد تفسير منفصل لهذه الآية , المعروض هو تفسير آية سابقة<br><hr class="dashed-line"><br>${text}`;
            }
            return text;
        }

        // Otherwise pick first larger verse (forward search)
        const next = availableVerses.find(v => v > verseNum);
        if (next !== undefined) {
            return `تفسير السورة في هذا الكتاب يبدأ من الآية رقم ${next}<br><hr class="dashed-line"><br>`;
        }

        return "لا يوجد تفسير لهذه الآية في كتاب التفسير المختار";

    } catch (error) {
        return "لا يوجد تفسير لهذه الآية في كتاب التفسير المختار";
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
        
        const select = document.getElementById('analysisSelect');
        const selectedSources = [select.value]; // Wrap in array for consistency
        
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
        //console.error(error);
        return null;
    }
}


document.getElementById('analysisSelect').addEventListener('change', displayVerseWithAnalyses);


async function displayVerseWithAnalyses() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');
    const meaningsDisplay = document.getElementById('meaningsDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);

    if (verseWithAnalyses) {
        let verseDisplayContent = '<hr class="dashed-line">';
        let meaningsDisplayContent = '';

        // Always display the main verse text
        verseDisplayContent += `<div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><hr class="dashed-line">`;

        const analysisSelect = document.getElementById('analysisSelect');
        const selected = analysisSelect.value;
        const selectedText = analysisSelect.options[analysisSelect.selectedIndex]?.text || '';

        const analysisContent = verseWithAnalyses.analyses[selected];
        if (analysisContent !== undefined) {
            meaningsDisplayContent += `<div class="rtl-text">${analysisContent}</div>`;
        }

        verseDisplay.innerHTML = verseDisplayContent || 'No content selected.';
        meaningsDisplay.innerHTML = meaningsDisplayContent || 'No content selected.';

        displayQuranPagesWithHighlight(verseWithAnalyses.verseData.page, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse or analyses not available.';
        meaningsDisplay.textContent = 'Verse or analyses not available.';
    }
    updateChapterVerse();
}

async function displayVerseWithAnalysesNoPageChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');
    const meaningsDisplay = document.getElementById('meaningsDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);

    if (verseWithAnalyses) {
        let verseDisplayContent = '<hr class="dashed-line">';
        let meaningsDisplayContent = '';

        // Always display the main verse text
        verseDisplayContent += `<div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><hr class="dashed-line">`;

        const analysisSelect = document.getElementById('analysisSelect');
        const selected = analysisSelect.value;
        const selectedText = analysisSelect.options[analysisSelect.selectedIndex]?.text || '';

        const analysisContent = verseWithAnalyses.analyses[selected];
        if (analysisContent !== undefined) {
            meaningsDisplayContent += `<div class="rtl-text">${analysisContent}</div>`;
        }
        
        verseDisplay.innerHTML = verseDisplayContent || 'No content selected.';
        meaningsDisplay.innerHTML = meaningsDisplayContent || 'No content selected.';
    } else {
        verseDisplay.textContent = 'Verse or analyses not available.';
        meaningsDisplay.textContent = 'Verse or analyses not available.';
    }
    updateChapterVerse();
}




function displayQuranPagesWithHighlight(pageNumber, selectedVerse) {
    const currentPagePath = `data/png/${pageNumber}.png`;
    const currentPageContainer = document.getElementById('currentPage');
    const nextPageContainer = document.getElementById('nextPage');
    const previousPageContainer = document.getElementById('previousPage');

    // Update the image sources for the current, next, and previous pages
    const nextPagePath = `data/png/${pageNumber + 1}.png`;
    const previousPagePath = `data/png/${pageNumber - 1}.png`;

    // Set the image sources dynamically
    currentPageContainer.querySelector('img').src = currentPagePath;
    nextPageContainer.querySelector('img').src = nextPagePath;
    previousPageContainer.querySelector('img').src = previousPagePath;

    // Update the page select dropdown
    const pageSelect = document.getElementById('pageSelect');
    pageSelect.value = pageNumber;

    // Call the function to handle page navigation (next and previous)
    displayNextPreviousPages(pageNumber);
    initializeVerseHighlighting();
}

function displayNextPreviousPages(pageNumber) {
    const nextPagePath = `data/png/${pageNumber + 1}.png`;
    const previousPagePath = `data/png/${pageNumber - 1}.png`;

    const previousPageContainer = document.getElementById('previousPage');
    const nextPageContainer = document.getElementById('nextPage');

    // You can perform additional logic for these containers if needed
}


function foldSearch(){
    const topic = document.getElementById('topicResults');
    const search = document.getElementById('searchResults');
    const verse = document.getElementById('verseColoumnId');

    if (search.style.display == 'block') {
        search.style.display = 'none';

    if (topic.style.display == 'block') {
        verse.style.width = '44%';
    }

    if (topic.style.display == 'none') {
    verse.style.width = '66%';
    } 

    } else {
    search.style.display = 'block';

    if (topic.style.display == 'block') {
        verse.style.width = '22%';
    }

    if (topic.style.display == 'none') {
    verse.style.width = '44%';
    } 
    }
    saveState();
}

function foldTopic(){
    const topic = document.getElementById('topicResults');
    const search = document.getElementById('searchResults');
    const verse = document.getElementById('verseColoumnId');

    if (topic.style.display == 'block') {
        topic.style.display = 'none';

    if (search.style.display == 'block') {
        verse.style.width = '44%';
    }

    if (search.style.display == 'none') {
    verse.style.width = '66%';
    } 

    } else {
    topic.style.display = 'block';

    if (search.style.display == 'block') {
        verse.style.width = '22%';
    }

    if (search.style.display == 'none') {
    verse.style.width = '44%';
    } 
    }
    saveState();
}


function initializeVerseHighlighting() {
    const pageIds = ["previousPage", "currentPage", "nextPage"];

    pageIds.forEach(pageId => {
        const imageContainer = document.getElementById(pageId);
        const image = imageContainer.querySelector('img');

        if (image) {
            const imageFilename = image.src.split('/').pop();
            fetchOverlayData(imageFilename, pageId);
        } else {
            //console.warn(`No image found in the ${pageId} container.`);
        }
    });
}

function fetchOverlayData(imageFilename, pageId) {
    const jsonFile = "data/png_overlay/" + imageFilename.replace(/\.[^/.]+$/, "") + "_overlay.json";
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Overlay JSON not found for ${pageId}`);
            }
            return response.json();
        })
        .then(data => {
            renderBoundingBoxes(data.regions, pageId);
        })
        .catch(error => {
            const imageContainer = document.getElementById(pageId);
            const overlay = imageContainer?.querySelector('.overlay-layer');
            if (overlay) {
                overlay.innerHTML = '';
            }
            window[`lastRenderedRegions_${pageId}`] = [];
        });
}


function renderBoundingBoxes(regions, pageId) {
    const imageContainer = document.getElementById(pageId);
    const image = imageContainer.querySelector('img');
    const overlay = imageContainer.querySelector('.overlay-layer');

    if (!image.complete) {
        image.onload = () => renderBoundingBoxes(regions, pageId);
        return;
    }

    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const containerWidth = image.clientWidth;
    const containerHeight = image.clientHeight;

    // Determine scale based on the limiting dimension
    const widthScale = containerWidth / imageWidth;
    const heightScale = containerHeight / imageHeight;
    const scale = Math.min(widthScale, heightScale);

    // Set the overlay size to match the scaled image
    overlay.style.width = `${imageWidth * scale}px`;
    overlay.style.height = `${imageHeight * scale}px`;
    overlay.style.transform = '';  // Remove transform-based scaling

    overlay.innerHTML = '';  // Clear any existing boxes

    regions.forEach(region => {
        const box = document.createElement('div');
        box.className = 'overlay-box blue-hover';

        // Scale position and size
        const scaledX = region.bbox.x * scale;
        const scaledY = region.bbox.y * scale;
        const scaledWidth = region.bbox.width * scale;
        const scaledHeight = region.bbox.height * scale;

        // Set box styles (border = 2px)
        box.style.left = `${scaledX - 0.75}px`;
        box.style.top = `${scaledY - 0.75 + scaledHeight / 8}px`;
        box.style.width = `${scaledWidth - 1}px`;
        box.style.height = `${scaledHeight - 1}px`;

        box.dataset.chapter = region.chapter;
        box.dataset.verse = region.verse;

        box.addEventListener('click', () => {
            const allBoxes = document.querySelectorAll('.overlay-box');
            allBoxes.forEach(box => box.classList.remove('highlighted'));

            allBoxes.forEach(otherBox => {
                if (otherBox.dataset.chapter === box.dataset.chapter && 
                    otherBox.dataset.verse === box.dataset.verse) {
                    otherBox.classList.add('highlighted');
                }
            });

            selectThisVerseNoPageChange(region.chapter, region.verse);
        });

        overlay.appendChild(box);
    });

    window[`lastRenderedRegions_${pageId}`] = regions;
    highlightSelectedChapterAndVerse();
}



function highlightSelectedChapterAndVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const allBoxes = document.querySelectorAll('.overlay-box');
    allBoxes.forEach(box => box.classList.remove('highlighted'));

    allBoxes.forEach(box => {
        if (box.dataset.chapter === selectedChapter && box.dataset.verse === selectedVerse) {
            box.classList.add('highlighted');
        }
    });
}



function showMobileColumn(className) {
    const columns = ['pageColoumn', 'verseColoumn', 'searchColoumn', 'topicColoumn'];
    columns.forEach(col => {
        const el = document.querySelector(`.${col}`);
        if (el) el.classList.remove('mobile-active');
    });

    const target = document.querySelector(`.${className}`);
    if (target) target.classList.add('mobile-active');
    initializeVerseHighlighting(); // Re-initialize highlighting after changing columns
    saveState();
    
}



// Show the mobileColumnSelector only in mobile mode
function checkMobileMode() {
    const mobileColumnSelector = document.getElementById('mobileColumnSelectorID');
    const container = document.getElementById("mobileOnlyVerseContent");
    const verseColumn = document.getElementById('verseColoumnId');
    if (window.innerWidth <= 768) { // Adjust the width as per your mobile breakpoint
        mobileColumnSelector.style.display = 'block';
        verseColumn.style.width = '100%'; // Set verseColoumn width to 100%
        if (container.children.length === 0) {
            container.innerHTML = `
            <button onclick="incrementVerse()">&#60;</button>
            <select id="verseSelect" class="verseSelectClass" onchange="onVerseChange()"></select>
            <button onclick="decrementVerse()">&#62;</button>
            <select id="chapterSelect" class="chapterSelectClass" onchange="onChapterChange()"></select>
            `;
            // Default to showing the page column
        }
    } else {
        mobileColumnSelector.style.display = 'none';
    }
}
