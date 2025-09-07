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

        displayQuranPagesWithHighlight(chapterSelect.value, selectedVerse);
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


async function displayQuranPagesWithHighlight(surahNumber, selectedVerse = null) {
    try {
        // Load the surah JSON
        const response = await fetch(`data/surah/surah_${surahNumber}.json`);
        const surahData = await response.json();
        console.log('Loaded surah data:', surahData);

        const startPage = surahData.start_page;
        const endPage = surahData.end_page;

        const pagesContainer = document.getElementById('pageResultsId'); 
        pagesContainer.innerHTML = ''; // clear previous pages

                // Loop through all pages in this surah
        for (let page = startPage; page <= endPage; page++) {
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
            pagesContainer.appendChild(pageDiv);

            // Initialize highlighting overlays for this page
            initializeVerseHighlightingForPage(img, pageDiv.id);
        }

        // Initialize verse highlighting (if needed)
        initializeVerseHighlighting(selectedVerse);

    } catch (err) {
        console.error(`Error loading surah ${surahNumber}:`, err);
    }
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

        box.addEventListener('click', () => {
            const allBoxes = document.querySelectorAll('.overlay-box');
            allBoxes.forEach(b => b.classList.remove('highlighted'));

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

    window[`lastRenderedRegions_${containerId}`] = regions;
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



