

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




// Search the CSV data and display results
async function searchInCSV() {
    const query = normalizeArabic(document.getElementById('verseSearchInput').value.trim());
    const includeRoots = document.getElementById('searchRootsCheckbox')?.checked; // Check if roots checkbox is selected
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
        <p><strong>الكلمات المبحوثة:</strong> ${wordList}</p>        
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




function hidesearchresults(){
    searchResultsContainer.style.display = `none`;
}

// Function to handle selecting a verse from search results
function selectSearchedVerseFromSearchResults(chapter, verse) {
    document.getElementById('chapterSelect').value = chapter;
    fetchSurahVerses(chapter).then(() => {
        document.getElementById('verseSelect').value = verse;
        displayVerseWithAnalyses(); // Display the selected verse with analyses
    });
}
