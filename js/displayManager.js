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
    const meaningsDisplay = document.getElementById('meaningsDisplay');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;

    const verseWithAnalyses = await fetchVerseWithAnalyses(selectedChapter, selectedVerse);
    console.log('Fetched verse with analyses:', verseWithAnalyses); // Debugging line

    if (verseWithAnalyses) {
        let verseDisplayContent = '<hr class="dashed-line">';
        let meaningsDisplayContent = '';

        // Always display the main verse text
        verseDisplayContent += `<strong>نص الآية</strong><br><br><div class="rtl-text">${verseWithAnalyses.verseData.text.ar}</div><br><hr class="dashed-line">`;

        const analysesToShow = ['ma3any', 'e3rab', 'baghawy', 'katheer', 'qortoby', 'sa3dy', 'tabary', 'waseet', 'muyassar', 'tanweer'];
        const analysesName = ['معاني الكلمات', 'الإعراب', 'البغوي', 'ابن كثير', 'القرطبي', 'السعدي', 'الطبري', 'الوسيط', 'الميسر', 'التنوير'];

        analysesToShow.forEach((analysisType, index) => {
            const checkbox = document.getElementById(`toggle${analysisType}`);
            if (checkbox && checkbox.checked) {
                const lowerCaseKey = analysisType.toLowerCase(); // Convert analysisType to lowercase
                console.log(`Displaying analysis for: ${analysisType}`, verseWithAnalyses.analyses[lowerCaseKey]); // Debugging line

                // Use the lowercase key to access the analysis data
                const analysisContent = verseWithAnalyses.analyses[lowerCaseKey];
                meaningsDisplayContent += `<strong>${analysesName[index]}:</strong><br><br><div class="rtl-text">${analysisContent || 'لا يوجد مدخل لهذه الآية'}</div><br><hr class="dashed-line">`;
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


// Function to display the corresponding Quran pages (SVG) and highlight the selected verse
function displayQuranPagesWithHighlight(pageNumber, selectedVerse) {

        const currentPagePath = `data/png/${(pageNumber)}.png`;
        const currentPageContainer = document.getElementById('currentPage');
        currentPageContainer.innerHTML = `<img src="${currentPagePath}" alt="Quran Page ${pageNumber}" style="width: 100%; height: auto; object-fit: contain; display: block;">`;
        displayNextPreviousPages(pageNumber);
        const pageSelect = document.getElementById('pageSelect');
        pageSelect.value = pageNumber;
}


// Function to display the next and previous Quran pages (SVG) in reversed order
function displayNextPreviousPages(pageNumber) {
    const nextPagePath = `data/png/${(pageNumber + 1)}.png`;
    const previousPagePath = `data/png/${(pageNumber - 1)}.png`;

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


function toggleSidebar() {
    var sidebar = document.getElementById("sidebarId");
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px";
    } else {
        sidebar.style.left = "0px";
    }

}


function toggleDropdown() {
    document.getElementById("dropdownList").style.display = "block";
}

function filterFunction() {
    let input = document.getElementById("dropdownInput");
    let filter = input.value.toLowerCase();
    let divs = document.getElementById("dropdownList").getElementsByTagName("div");
    for (let i = 0; i < divs.length; i++) {
        let txtValue = divs[i].textContent || divs[i].innerText;
        divs[i].style.display = txtValue.toLowerCase().includes(filter) ? "" : "none";
    }
}

function selectItem(element) {
    document.getElementById("dropdownInput").value = element.innerText;
    document.getElementById("dropdownList").style.display = "none";
}

document.addEventListener("click", function(event) {
    if (!event.target.closest(".dropdown")) {
        document.getElementById("dropdownList").style.display = "none";
    }
});



function foldSearch(){
    const Container = document.getElementById('searchResults');
    const Container2 = document.getElementById('verseColoumnId');
    if (Container.style.display === 'block') {
        Container.style.display = 'none';
        if (Container2.style.width === '25%') {
            Container2.style.width = '50%';
        }
        if (Container2.style.width === '50%') {
            Container2.style.width = '75%';
        }
    } else {
        Container.style.display = 'block';
        if (Container2.style.width === '50%') {
            Container2.style.width = '25%';
        }
        if (Container2.style.width === '75%') {
            Container2.style.width = '50%';
        }
    }  
}

function foldTopic(){
    const Container = document.getElementById('topicResults');
    const Container2 = document.getElementById('verseColoumnId');
    if (Container.style.display === 'block') {
        Container.style.display = 'none';
        if (Container2.style.width === '25%') {
            Container2.style.width = '50%';
        }
        if (Container2.style.width === '50%') {
            Container2.style.width = '75%';
        }
    } else {
        Container.style.display = 'block';
        if (Container2.style.width === '50%') {
            Container2.style.width = '25%';
        }
        if (Container2.style.width === '75%') {
            Container2.style.width = '50%';
        }
    }  
}