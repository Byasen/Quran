// Main JS file that handles page initialization and events

// Function to increment the verse
function incrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    const currentVerseIndex = verseSelect.selectedIndex;
    
    if (currentVerseIndex < verseSelect.options.length - 1) {
        // Move to the next verse
        verseSelect.selectedIndex = currentVerseIndex + 1;
        displayVerseWithAnalyses();
    }
}

// Function to decrement the verse
function decrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    const currentVerseIndex = verseSelect.selectedIndex;
    
    if (currentVerseIndex > 0) {
        // Move to the previous verse
        verseSelect.selectedIndex = currentVerseIndex - 1;
        displayVerseWithAnalyses();
    }
}



// Event triggered when the Surah (chapter) changes
function onChapterChange() {
    const chapterSelect = document.getElementById('chapterSelect');
    const selectedChapter = chapterSelect.value;
    
    // Fetch the verses of the selected chapter
    fetchSurahVerses(selectedChapter).then(() => {
        const verseSelect = document.getElementById('verseSelect');
        
        // Reset the verse to the first one in the list
        if (verseSelect.options.length > 0) {
            verseSelect.selectedIndex = 0;
        }

        // Display the selected verse with analyses (the first verse)
        displayVerseWithAnalyses();
    });
}


function onVerseChange() {
    displayVerseWithAnalyses();
}



// Check all checkboxes
function checkAll() {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
    displayVerseWithAnalyses();
}

// Uncheck all checkboxes
function uncheckAll() {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    displayVerseWithAnalyses();
}

// Load a saved state from a file (modified for topics)
function loadState() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                const fullState = JSON.parse(e.target.result);

                // Log the parsed JSON to verify the structure
                console.log("Parsed JSON:", fullState);

                // Restore the topics
                topics = fullState.topics || [];
                populateTopicsDropdown();

                // Restore the current topic
                const currentTopic = fullState.currentTopic || '';
                document.getElementById('topicSelect').value = currentTopic;

                const topic = topics.find(topic => topic.topicName === currentTopic);
                if (topic) {
                    document.getElementById('questionInput').value = topic.questionInput || '';
                    document.getElementById('answerInput').value = topic.answerInput || '';

                    // Clear current stacked verses
                    document.getElementById('stackedVerses').innerHTML = '';

                    // Prepare the verses to fetch
                    const versesToFetch = topic.verses.map(({ surahNumber, verseNumber }) => ({ surahNumber, verseNumber }));

                    // Batch fetch the verses
                    const fetchedVerses = await fetchVersesBatch(versesToFetch);

                    // Iterate through the fetched verses and add them to the stack
                    for (i = fetchedVerses.length - 1; i >= 0; i--){
                        const { surahNumber, verseNumber, verseNotes } = topic.verses[i];
                        const verseData = fetchedVerses[i];

                        if (verseData) {
                            // Add the verse to the stacked verses
                            await addVerse(surahNumber, verseNumber);

                            // Update the notes for the newly added verse
                            const stackedVerses = document.getElementById('stackedVerses').children;
                            const lastVerseDiv = stackedVerses[0]; // Get the most recently added verse
                            const textArea = lastVerseDiv.querySelector('textarea');
                            if (textArea) {
                                textArea.value = verseNotes || "";
                            }
                        }
                    }
                }

                // Restore the current chapter and verse
                const currentChapter = fullState.currentChapter || '';
                const currentVerse = fullState.currentVerse || '';
                document.getElementById('chapterSelect').value = currentChapter;
                await fetchSurahVerses(currentChapter);
                document.getElementById('verseSelect').value = currentVerse;

                // Display the verse with analyses
                displayVerseWithAnalyses();

                console.log("State loaded successfully.");
            } catch (error) {
                console.error("Error parsing or restoring state:", error.message);
            }
        };

        if (file) {
            reader.readAsText(file);
        }
    };

    fileInput.click();
}


// Enable Ctrl+S for saving the state without opening a new tab
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent the default browser save dialog
        saveStateNoNewTab(); // Call the new function without opening a tab
        console.log("Ctrl+S pressed: State saved (no new tab).");
    }
});

// Add event listener to handle keyboard navigation for page changes
document.addEventListener('keydown', function(event) {
        // Flip the arrow key actions: Right key now moves to the previous page, Left key moves to the next page
        if (event.key === 'ArrowRight') {
            decrementVerse(); // Move to the next page
        }
        
        if (event.key === 'ArrowLeft') {
            incrementVerse(); // Move to the previous page
        }
});


// Import the template data from "data/researches/template.json"
function importTemplateData() {
    fetch('stored/all.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Template file not found');
            }
            return response.json();
        })
        .then(data => {
            // Populate the topics dropdown with the newly loaded template data
            topics = data.topics || [];
            populateTopicsDropdown();

            // Optionally, auto-select the first topic after loading
            if (topics.length > 0) {
                document.getElementById('topicSelect').value = topics[0].topicName;
                restoreState(); // Restore the first topic's state
            }
        })
        .catch(error => {
            console.error("Error loading template data:", error.message);
        });
}


    
window.onload = async function () {
    await loadMetadata(); // Initialize the page by loading metadata
    await importTemplateData();
    const randomChapter = Math.floor(Math.random() * 114) + 1;
    const tempPath = `data/surah/surah_${randomChapter}.json`;
    const response = await fetch(tempPath);
    tempSurah = await response.json();
    const tempVerseCount =  tempSurah.verses.length;
    const randomVerse = Math.floor(Math.random() * tempVerseCount) + 1;
    selectStackedVerse(randomChapter, randomVerse);
    await loadCSVData(); // Load `quranText.csv` file

};



// Function to filter chapters based on the search input and select the first filtered chapter
function filterChapters() {
    const searchInput = document.getElementById('chapterSearchInput').value.toLowerCase();
    const chapterSelect = document.getElementById('chapterSelect');
    const options = chapterSelect.options;
    let firstVisibleOption = null;

    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent.toLowerCase();
        if (optionText.includes(searchInput)) {
            options[i].style.display = '';  // Show the matching option
            if (!firstVisibleOption) {
                firstVisibleOption = options[i];
            }
        } else {
            options[i].style.display = 'none';  // Hide non-matching option
        }
    }

    // Automatically select the first filtered chapter if available
    if (firstVisibleOption) {
        firstVisibleOption.selected = true;
        onChapterChange();  // Trigger chapter change to load verses for the first filtered chapter
    }
}


let csvData = [];

async function loadCSVData() {
    try {
        const response = await fetch('data/quranText.csv');
        let csvText = await response.text();

        // Replace unexpected characters (optional, if needed)
        csvText = csvText.replace(/\u200E/g, '').trim();

        // Split rows and initialize invalid row counter
        const rows = csvText.split('\n');
        let invalidRowCount = 0;

        console.log(`Total rows in CSV (including header): ${rows.length}`);

        csvData = rows.slice(1).map((row, index) => {
            const columns = row.split(',');

            // Check for invalid rows (less than expected columns)
            if (columns.length < 6) {
                console.warn(`Invalid row ${index + 2}:`, row);
                invalidRowCount++;
                return null; // Skip invalid rows
            }

            const [id, page, chapter, verse, text, chapterName] = columns;

            return {
                chapter: chapter ? chapter.trim() : '',
                verse: verse ? verse.trim() : '',
                text: text ? text.trim() : '',
                chapterName: chapterName ? chapterName.trim() : ''
            };
        });

        // Filter out null entries (invalid rows)
        csvData = csvData.filter(entry => entry !== null);

        console.log('CSV data loaded successfully:', csvData);
        console.log(`Valid rows: ${csvData.length}`);
        console.log(`Invalid rows: ${invalidRowCount}`); // Log number of invalid rows
    } catch (error) {
        console.error('Error loading CSV file:', error);
    }
}

// Normalize Arabic text for consistent searching
function normalizeArabic(text) {
    return text
        .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
}

// Search the CSV data and display results
async function searchInCSV() {
    const query = normalizeArabic(document.getElementById('verseSearchInput').value.trim());
    const includeRoots = document.getElementById('searchRootsCheckbox')?.checked; // Check if roots checkbox is selected
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    searchResultsContainer.innerHTML = ''; // Clear previous results

    if (!query) {
        searchResultsContainer.innerHTML = '<p>الرجاء إدخال نص للبحث.</p>';
        return;
    }

    // Step 2.5: If roots checkbox is checked, get the list of words from roots.json
    let wordList = [query]; // Start with the query as the base word

    if (includeRoots) {
        try {
            const rootWords = await getWordsFromRoots(query);
            wordList = [...new Set([...wordList, ...rootWords])]; // Combine query and root-derived words, remove duplicates
        } catch (error) {
            console.error("Error loading roots data:", error);
            searchResultsContainer.innerHTML = '<p>خطأ في تحميل بيانات الجذور.</p>';
            return;
        }
    }

    console.log("^^^^^^")
    console.log(wordList)
    console.log("^^^^^^")
    

    // Step 3: Search for all words in the wordList
    const matches = csvData.filter(entry => 
        wordList.some(word => normalizeArabic(entry.text).includes(word))
    );

    if (matches.length === 0) {
        searchResultsContainer.innerHTML = `<p>لم يتم العثور على نتائج لـ "${query}".</p>`;
        return;
    }

    // Calculate statistics
    const chapterOccurrences = {};
    matches.forEach(match => {
        if (!chapterOccurrences[match.chapter]) {
            chapterOccurrences[match.chapter] = { count: 0, name: match.chapterName };
        }
        chapterOccurrences[match.chapter].count++;
    });

    const uniqueChapters = Object.keys(chapterOccurrences).length;

    // Create a summary section
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('search-summary');
    summaryDiv.innerHTML = `
        <p><strong>إجمالي النتائج:</strong> ${matches.length}</p>
        <p><strong>عدد السور المميزة:</strong> ${uniqueChapters}</p>
        <p><strong>التكرار لكل سورة:</strong></p>
        <ul>
            ${Object.entries(chapterOccurrences)
                .map(([chapter, { count, name }]) => `<li>سورة ${name} (${chapter}): ${count} مرات</li>`)
                .join('')}
        </ul>
    `;

    searchResultsContainer.appendChild(summaryDiv);

    // Display search results
    matches.forEach(match => {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('search-result');

        resultDiv.innerHTML = `
            <strong>سورة ${match.chapterName} (${match.chapter}) (آية ${match.verse})</strong><br>
            ${match.text}
        `;

        const selectButton = document.createElement('button');
        selectButton.textContent = 'اختيار';
        selectButton.onclick = () => selectSearchedVerseFromSearchResults(match.chapter, match.verse);

        resultDiv.appendChild(selectButton);
        searchResultsContainer.appendChild(resultDiv);
    });
}


async function getWordsFromRoots(query) {
    try {
        const response = await fetch('data/roots.json');
        if (!response.ok) {
            throw new Error("Failed to load roots.json");
        }
        const rootsData = await response.json();

        // Find the root that matches the query
        const matchingRoot = rootsData.roots.find(root => root.root === query);

        // Return the associated words, or an empty list if no match
        return matchingRoot ? matchingRoot.words : [];
    } catch (error) {
        console.error("Error fetching or processing roots.json:", error);
        throw error;
    }
}


// Function to handle selecting a verse from search results
function selectSearchedVerseFromSearchResults(chapter, verse) {
    document.getElementById('chapterSelect').value = chapter;
    fetchSurahVerses(chapter).then(() => {
        document.getElementById('verseSelect').value = verse;
        displayVerseWithAnalyses(); // Display the selected verse with analyses
    });
}


function toggleQuranPages() {
    const quranPagesContainer = document.getElementById('quranPagesContainer');
    const toggleBtn = document.getElementById('toggleQuranPagesBtn');

    if (quranPagesContainer.style.display === 'none') {
        quranPagesContainer.style.display = 'flex';
        toggleBtn.textContent = 'اخفاء الصفحة';
    } else {
        quranPagesContainer.style.display = 'none';
        toggleBtn.textContent = 'عرض الصفحة';
    }
}


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        sidebar.style.display = 'block';
    } else {
        sidebar.classList.add('hidden');
        sidebar.style.display = 'none';
    }
}

function toggleMeanings() {
    const sidebar = document.getElementById('Meanings');
    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        sidebar.style.display = 'block';
    } else {
        sidebar.classList.add('hidden');
        sidebar.style.display = 'none';
    }
}


