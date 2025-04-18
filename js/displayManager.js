// Fetch a specific analysis for a verse (individual fetch)
async function fetchAnalysis(chapterNumber, verseNumber, source) {
    try {
        const filePath = `data/tafseer/${source}/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`;
        //console.log(`Fetching analysis from: ${filePath}`); // Debugging line

        const response = await fetch(filePath);
        if (response.ok) {
            const analysisData = await response.json();
            //console.log(`Fetched data for ${source}:`, analysisData); // Debugging line
            return analysisData.text || `لا يوجد مدخل لهذه الآية`;
        } else {
            //console.error(`Failed to fetch ${source} analysis for ${chapterNumber}:${verseNumber}`);
            return `No ${source} analysis available`;
        }
    } catch (error) {
        //console.error(`Error fetching ${source}:`, error);
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
                //console.warn(`Checkbox not found for: ${source}`);
            } else {
                //console.log(`Checkbox for ${source}: ${checkbox.checked}`);
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
        //console.error(error);
        return null;
    }
}


// Display the verse and analyses
async function displayVerseWithAnalyses() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');
    const meaningsDisplay = document.getElementById('meaningsDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);
    //console.log('Fetched verse with analyses:', verseWithAnalyses); // Debugging line

    if (verseWithAnalyses) {
        let verseDisplayContent = '<hr class="dashed-line">';
        let meaningsDisplayContent = '';

        // Always display the main verse text
        verseDisplayContent += `<div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><hr class="dashed-line">`;

        const analysesToShow = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];
        const analysesName = ['معاني الكلمات', 'الإعراب', 'البغوي', 'ابن كثير', 'القرطبي', 'السعدي', 'الطبري', 'الوسيط', 'الميسر', 'التنوير'];

        analysesToShow.forEach((analysisType, index) => {
            const checkbox = document.getElementById(`toggle${analysisType}`);
            if (checkbox && checkbox.checked) {
                const lowerCaseKey = analysisType.toLowerCase(); // Convert analysisType to lowercase
                //console.log(`Displaying analysis for: ${analysisType}`, verseWithAnalyses.analyses[lowerCaseKey]); // Debugging line

                // Use the lowercase key to access the analysis data
                const analysisContent = verseWithAnalyses.analyses[lowerCaseKey];
                meaningsDisplayContent += `<strong>${analysesName[index]}:</strong><div class="rtl-text">${analysisContent || 'لا يوجد مدخل لهذه الآية'}</div><br><hr class="dashed-line">`;
            }
        });

        verseDisplay.innerHTML = verseDisplayContent || 'No content selected.';
        meaningsDisplay.innerHTML = meaningsDisplayContent || 'No content selected.';
        displayQuranPagesWithHighlight(verseWithAnalyses.verseData.page, selectedVerse);
    } else {
        verseDisplay.textContent = 'Verse or analyses not available.';
        meaningsDisplay.textContent = 'Verse or analyses not available.';
    }
}


// Display the verse and analyses
async function displayVerseWithAnalysesNoPageChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const verseDisplay = document.getElementById('verseDisplay');
    const meaningsDisplay = document.getElementById('meaningsDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);
    //console.log('Fetched verse with analyses:', verseWithAnalyses); // Debugging line

    if (verseWithAnalyses) {
        let verseDisplayContent = '<hr class="dashed-line">';
        let meaningsDisplayContent = '';

        // Always display the main verse text
        verseDisplayContent += `<div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><hr class="dashed-line">`;

        const analysesToShow = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];
        const analysesName = ['معاني الكلمات', 'الإعراب', 'البغوي', 'ابن كثير', 'القرطبي', 'السعدي', 'الطبري', 'الوسيط', 'الميسر', 'التنوير'];

        analysesToShow.forEach((analysisType, index) => {
            const checkbox = document.getElementById(`toggle${analysisType}`);
            if (checkbox && checkbox.checked) {
                const lowerCaseKey = analysisType.toLowerCase(); // Convert analysisType to lowercase
                //console.log(`Displaying analysis for: ${analysisType}`, verseWithAnalyses.analyses[lowerCaseKey]); // Debugging line

                // Use the lowercase key to access the analysis data
                const analysisContent = verseWithAnalyses.analyses[lowerCaseKey];
                meaningsDisplayContent += `<strong>${analysesName[index]}:</strong><div class="rtl-text">${analysisContent || 'لا يوجد مدخل لهذه الآية'}</div><br><hr class="dashed-line">`;
            }
        });

        verseDisplay.innerHTML = verseDisplayContent || 'No content selected.';
        meaningsDisplay.innerHTML = meaningsDisplayContent || 'No content selected.';
    } else {
        verseDisplay.textContent = 'Verse or analyses not available.';
        meaningsDisplay.textContent = 'Verse or analyses not available.';
    }
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



function toggleSidebar() {
    var sidebar = document.getElementById("sidebarId");
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px";
    } else {
        sidebar.style.left = "0px";
    }

}


function foldSearch(){
    const Container = document.getElementById('searchResults');
    const Container2 = document.getElementById('verseColoumnId');
    //console.log("the width is :", Container2.style.width);
    if (Container.style.display === 'block') {
        Container.style.display = 'none';
        if (Container2.style.width === "22%") {
            Container2.style.width = '44%';
        }
        if (Container2.style.width === "44%") {
            Container2.style.width = '66%';
        }
    } else {
        Container.style.display = 'block';
        if (Container2.style.width === "44%") {
            Container2.style.width = "22%";
        }
        if (Container2.style.width === "66%") {
            Container2.style.width = '44%';
        }
    }
    initializeVerseHighlighting();  
}

function foldTopic(){
    const Container = document.getElementById('topicResults');
    const Container2 = document.getElementById('verseColoumnId');

    if (Container.style.display === 'block') {
        Container.style.display = 'none';
        if (Container2.style.width === '22%') {
            Container2.style.width = '44%';
        }
        if (Container2.style.width === '44%') {
            Container2.style.width = '66%';
        }
    } else {
        Container.style.display = 'block';
        if (Container2.style.width === '44%') {
            Container2.style.width = '22%';
        }
        if (Container2.style.width === '66%') {
            Container2.style.width = '44%';
        }
    }  
       
    initializeVerseHighlighting();
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
            //console.error(`Error loading overlay data for ${pageId}:`, error);

            // 🚫 Clear the previous overlay if present
            const imageContainer = document.getElementById(pageId);
            const overlay = imageContainer?.querySelector('.overlay-layer');
            if (overlay) {
                overlay.innerHTML = '';
            }

            // 💡 Optionally clear lastRenderedRegions for this page
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

    overlay.style.width = `${image.naturalWidth}px`;
    overlay.style.height = `${image.naturalHeight}px`;

    const scale = image.clientWidth / image.naturalWidth;
    overlay.style.transform = `scale(${scale})`;

    overlay.innerHTML = '';

    regions.forEach(region => {
        const box = document.createElement('div');
        box.className = 'overlay-box blue-hover';  // Make all boxes invisible initially

        box.style.left = `${region.bbox.x}px`;
        box.style.top = `${region.bbox.y}px`;
        box.style.width = `${region.bbox.width}px`;
        box.style.height = `${region.bbox.height}px`;

        // Store chapter and verse data in the box
        box.dataset.chapter = region.chapter;
        box.dataset.verse = region.verse;

        box.addEventListener('click', () => {
            // Show custom popup with only chapter and verse


        // Get all overlay boxes
        const allBoxes = document.querySelectorAll('.overlay-box');



        // Clear previous highlights
        allBoxes.forEach(box => {
            box.classList.remove('highlighted');
        });

            // Highlight the clicked box and all matching boxes
            box.classList.add('highlighted');

            // Highlight all other boxes with the same chapter and verse
            allBoxes.forEach(otherBox => {
                if (otherBox.dataset.chapter === box.dataset.chapter && 
                    otherBox.dataset.verse === box.dataset.verse) {
                    otherBox.classList.add('highlighted');
                }
            });

            // Pass chapter and verse to selectThisVerse
            selectThisVerseNoPageChange(region.chapter, region.verse);
        });

        overlay.appendChild(box);
    });

    window[`lastRenderedRegions_${pageId}`] = regions;
    highlightSelectedChapterAndVerse();
}

// Function to show the pop-up message at the center of the screen
function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;

    // Style the popup
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    popup.style.color = 'white';
    popup.style.padding = '10px 20px';
    popup.style.borderRadius = '5px';
    popup.style.fontSize = '14px';
    popup.style.zIndex = '1000';  // Ensure it's on top of other content

    // Append the popup to the body
    document.body.appendChild(popup);

    // Remove the popup after 1 second
    setTimeout(() => {
        popup.remove();
    }, 1000);
}



// Function to highlight boxes based on the selected chapter and verse from dropdown menus
function highlightSelectedChapterAndVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');

    // Get the selected chapter and verse values
    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;



    // Get all overlay boxes
    const allBoxes = document.querySelectorAll('.overlay-box');



    // Clear previous highlights
    allBoxes.forEach(box => {
        box.classList.remove('highlighted');
    });

    // Highlight the boxes that match the selected chapter and verse
    allBoxes.forEach(box => {

        if (box.dataset.chapter === selectedChapter && box.dataset.verse === selectedVerse) {
            // Debug: Log when a match is found
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
}


// Show the mobileColumnSelector only in mobile mode
function checkMobileMode() {
    const mobileColumnSelector = document.getElementById('mobileColumnSelectorID');
    const container = document.getElementById("mobileOnlyVerseContent");
    if (window.innerWidth <= 768) { // Adjust the width as per your mobile breakpoint
        mobileColumnSelector.style.display = 'block';
        showMobileColumn('pageColoumn');
        if (container.children.length === 0) {
            container.innerHTML = `
            <select id="chapterSelect" class="chapterSelectClass" onchange="onChapterChange()"></select>
            <button onclick="incrementVerse()">&#60;</button>
            <select id="verseSelect" class="verseSelectClass" onchange="onVerseChange()"></select>
            <button onclick="decrementVerse()">&#62;</button
            `;
            // Default to showing the page column
    } else {
        mobileColumnSelector.style.display = 'none';
    }
    }
}