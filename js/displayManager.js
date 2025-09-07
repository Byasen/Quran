const textarea = document.getElementById('topicIntro');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto'; // Reset height
  textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
});

textarea.addEventListener('focus', () => {
  textarea.style.height = 'auto'; // Reset height
  textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
});


// Global cache: { source: { index: {...}, [chapterNumber]: [availableVerses] } }
const tafseerCache = {};

/**
 * Load available verses for a given chapter and tafseer source
 */
async function loadAvailableVerses(chapterNumber, source) {
    // Return from cache if available
    if (tafseerCache[source]?.[chapterNumber]) {
        return tafseerCache[source][chapterNumber];
    }

    // Load the index JSON once per source
    if (!tafseerCache[source]?.index) {
        try {
            const response = await fetch(`data/tafseer/${source}/tafseer_index.json`);
            const indexData = await response.json();
            tafseerCache[source] = tafseerCache[source] || {};
            tafseerCache[source].index = indexData.surahs || {};
        } catch (err) {
            console.error(`Failed to load tafseer index for ${source}:`, err);
            tafseerCache[source].index = {};
        }
    }

    const chapterEntry = tafseerCache[source].index[chapterNumber];
    const availableVerses = chapterEntry?.verses || [];

    // Cache available verses per chapter
    tafseerCache[source][chapterNumber] = availableVerses;
    return availableVerses;
}

/**
 * Fetch tafseer analysis for a specific chapter and verse
 */
async function fetchAnalysis(chapterNumber, verseNumber, source) {
    try {
        const verseNum = Number(verseNumber);
        const availableVerses = await loadAvailableVerses(chapterNumber, source);

        if (availableVerses.length === 0) {
            // Chapter has no tafseer → list all chapters in the book
            const allChapters = tafseerCache[source].index;
            const arabicLines = Object.keys(allChapters).map(ch => {
                const entry = allChapters[ch];
                return `${ch}: ${entry.name}`;
            });

            if (arabicLines.length > 0) {
                return `الكتاب لا يحتوي على تفسير للسورة المطلوبة, قائمة السور في هذا الكتاب : <br><hr class="dashed-line"><br>${arabicLines.join('<br>')}`;
            } else {
                return "لم يتم العثور على سور مدعومة في هذا الكتاب.";
            }
        }

        // Find closest verse ≤ requested verse
        let chosen = availableVerses.filter(v => v <= verseNum).pop();

        if (chosen !== undefined) {
            const filePath = `data/tafseer/${source}/${padNumber(chapterNumber)}_${padNumber(chosen)}.json`;
            const response = await fetch(filePath);
            if (!response.ok) throw new Error("Tafseer file not found");

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

        displayQuranPagesWithHighlight(chapterSelect.value, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse or analyses not available.';
        meaningsDisplay.textContent = 'Verse or analyses not available.';
    }
    updateChapterVerse();
}


async function displayQuranPagesWithHighlight(surahNumber, selectedVerse = null) {
    try {
        const response = await fetch(`data/surah/surah_${surahNumber}.json`);
        const surahData = await response.json();

        const pagesContainer = document.getElementById('pageResultsId');
        pagesContainer.innerHTML = ''; // clear previous pages

        let selectedPage;

        if (selectedVerse) {
            const verseInfo = surahData.verses.find(v => v.number === parseInt(selectedVerse));
            selectedPage = verseInfo ? verseInfo.page : surahData.start_page;
        } else {
            selectedPage = surahData.start_page;
        }

        // Pages to load: previous, current, next
        let pagesToLoad = [selectedPage - 1, selectedPage, selectedPage + 1];
        pagesToLoad = pagesToLoad.filter(
            p => p >= surahData.start_page && p <= surahData.end_page
        );

        for (let page of pagesToLoad) {
            await loadQuranPage(page, pagesContainer);
        }

        // Store range of loaded pages for dynamic expansion
        pagesContainer.dataset.loadedStart = Math.min(...pagesToLoad);
        pagesContainer.dataset.loadedEnd = Math.max(...pagesToLoad);

    } catch (err) {
        console.error(`Error loading surah ${surahNumber}:`, err);
    }
    
}

async function loadQuranPage(page, pagesContainer, prepend = false) {
    // Avoid duplicate loading
    if (document.getElementById(`page_${page}`)) return;

    const pageDiv = document.createElement('div');
    pageDiv.classList.add('pageimg');
    pageDiv.id = `page_${page}`;

    const img = document.createElement('img');
    img.src = `data/png/${page}.png`;
    img.alt = `Page ${page}`;

    const overlay = document.createElement('div');
    overlay.classList.add('overlay-layer');

    pageDiv.appendChild(img);
    pageDiv.appendChild(overlay);

    if (prepend) {
        const firstChild = pagesContainer.firstChild;

        // Record scroll position relative to container
        const prevScrollTop = pagesContainer.scrollTop;
        const prevFirstChildOffset = firstChild ? firstChild.offsetTop : 0;

        // Prepend the new page
        pagesContainer.insertBefore(pageDiv, firstChild);

        // Wait for image to load before initializing overlays
        img.onload = () => {
            initializeVerseHighlightingForPage(img, pageDiv.id);

            // Adjust scrollTop so previous content stays in view
            const newFirstChildOffset = firstChild.offsetTop;
            pagesContainer.scrollTop = prevScrollTop + (newFirstChildOffset - prevFirstChildOffset);
        };
    } else {
        pagesContainer.appendChild(pageDiv);
        img.onload = () => initializeVerseHighlightingForPage(img, pageDiv.id);
    }
}


function renderBoundingBoxesForPage(regions, imageElement, containerId) {
    const imageContainer = document.getElementById(containerId);
    const overlay = imageContainer.querySelector('.overlay-layer');

    if (!imageElement.complete) {
        imageElement.onload = () => renderBoundingBoxesForPage(regions, imageElement, containerId);
        return;
    }

    const imageWidth = imageElement.naturalWidth;
    const imageHeight = imageElement.naturalHeight;
    const containerWidth = imageElement.clientWidth;
    const containerHeight = imageElement.clientHeight;

    const widthScale = containerWidth / imageWidth;
    const heightScale = containerHeight / imageHeight;
    const scale = Math.min(widthScale, heightScale);

    overlay.style.width = `${imageWidth * scale}px`;
    overlay.style.height = `${imageHeight * scale}px`;
    overlay.style.transform = '';
    overlay.innerHTML = '';

    regions.forEach(region => {
        const box = document.createElement('div');
        box.className = 'overlay-box blue-hover';

        const scaledX = region.bbox.x * scale;
        const scaledY = region.bbox.y * scale;
        const scaledWidth = region.bbox.width * scale;
        const scaledHeight = region.bbox.height * scale;

        box.style.left = `${scaledX - 0.75}px`;
        box.style.top = `${scaledY - 0.75 + scaledHeight / 8}px`;
        box.style.width = `${scaledWidth - 1}px`;
        box.style.height = `${scaledHeight - 1}px`;

        box.dataset.chapter = region.chapter;
        box.dataset.verse = region.verse;
        box.dataset.page = region.page; // assuming your overlay has page info

        box.addEventListener('click', () => {
            const allBoxes = document.querySelectorAll('.overlay-box');
            allBoxes.forEach(b => b.classList.remove('highlighted'));

            allBoxes.forEach(otherBox => {
                if (otherBox.dataset.chapter === box.dataset.chapter &&
                    otherBox.dataset.verse === box.dataset.verse) {
                    otherBox.classList.add('highlighted');
                }
            });

            selectThisVerse(region.chapter, region.verse);

            // === NEW: Expand pages dynamically if needed ===
            const pagesContainer = document.getElementById('pageResultsId');
            const currentPage = parseInt(box.dataset.page);

            const loadedStart = parseInt(pagesContainer.dataset.loadedStart);
            const loadedEnd = parseInt(pagesContainer.dataset.loadedEnd);

            if (currentPage === loadedStart) {
                loadQuranPage(loadedStart - 1, pagesContainer, true); // prepend
                pagesContainer.dataset.loadedStart = loadedStart - 1;
            } else if (currentPage === loadedEnd) {
                loadQuranPage(loadedEnd + 1, pagesContainer, false); // append
                pagesContainer.dataset.loadedEnd = loadedEnd + 1;
            }
        });

        overlay.appendChild(box);
    });

    window[`lastRenderedRegions_${containerId}`] = regions;
    highlightSelectedChapterAndVerse();
}


function initializeVerseHighlightingForPage(imageElement, containerId) {
    if (!imageElement) return;

    const imageFilename = imageElement.src.split('/').pop();
    const jsonFile = "data/png_overlay/" + imageFilename.replace(/\.[^/.]+$/, "") + "_overlay.json";

    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Overlay JSON not found for ${containerId}`);
            }
            return response.json();
        })
        .then(data => {
            renderBoundingBoxesForPage(data.regions, imageElement, containerId);
        })
        .catch(error => {
            const imageContainer = document.getElementById(containerId);
            const overlay = imageContainer?.querySelector('.overlay-layer');
            if (overlay) {
                overlay.innerHTML = '';
            }
            window[`lastRenderedRegions_${containerId}`] = [];
        });
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
    saveState();
    
}



