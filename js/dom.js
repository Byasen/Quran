// Populate Surah dropdown
function populateChapters() {
    const chapterSelect = document.getElementById('chapterSelect');
    chapterSelect.innerHTML = ''; // Clear previous options

    quranMetadata.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
        chapterSelect.appendChild(option);
    });

    // Auto-load verses for the first chapter
    onChapterChange();
}

// Populate verses dropdown for the selected Surah
function populateVerses(verses) {
    const verseSelect = document.getElementById('verseSelect');
    verseSelect.innerHTML = ''; // Clear previous options

    if (!verses || verses.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No verses available';
        verseSelect.appendChild(option);
    } else {
        verses.forEach(verse => {
            const option = document.createElement('option');
            option.value = verse.number;
            option.textContent = `Verse ${verse.number}`;
            verseSelect.appendChild(option);
        });

        // Auto-display the first verse
        displayVerse();
    }
}

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

        // Display the corresponding Quran pages based on the page number in the JSON and highlight the selected verse
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
                    verseElement.setAttribute("style", "fill: blue;"); // Apply blue color to the verse text
                }

                const currentPageContainer = document.getElementById('currentPage');
                currentPageContainer.innerHTML = ''; // Clear the previous content
                currentPageContainer.appendChild(svgElement); // Append the modified SVG
            });

        // Load the previous and next pages as normal
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

// Helper function to fetch the verse data
async function fetchVerse(chapterNumber, verseNumber) {
    try {
        const response = await fetch(`data/verses/${padNumber(chapterNumber)}_${padNumber(verseNumber)}.json`);
        if (!response.ok) {
            throw new Error('Verse file not found');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Helper function to pad the number with leading zeros (for filenames)
function padNumber(num) {
    return String(num).padStart(3, '0');
}

// Add the selected verse to the stacked section
async function addVerse() {
    const chapterSelect = document.getElementById('chapterSelect');
    const verseSelect = document.getElementById('verseSelect');
    const stackedVerses = document.getElementById('stackedVerses');

    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;
    const selectedSurah = quranMetadata.find(surah => surah.number == selectedChapter);

    const verseData = await fetchVerse(selectedChapter, selectedVerse);
    if (verseData) {
        // Create a new div to hold the verse content and remove button
        const newVerseDiv = document.createElement('div');
        newVerseDiv.classList.add('verse');
        newVerseDiv.innerHTML = `
            <strong>Surah ${selectedSurah.number}: ${selectedSurah.name.en} (${selectedSurah.name.ar}), Ayah ${selectedVerse}</strong><br>
            <strong>Arabic:</strong> ${verseData.text.ar}
            <br><button onclick="removeVerse(this)">Remove</button>
            <button onclick="selectStackedVerse(${selectedChapter}, ${selectedVerse})">Select</button>
        `;

        // Add a text area for user notes
        const notesTextArea = document.createElement('textarea');
        notesTextArea.placeholder = "Add your notes here...";
        notesTextArea.rows = 3;
        notesTextArea.style.width = '100%'; // Make it span the full width

        // Add the text area below the verse
        newVerseDiv.appendChild(notesTextArea);

        // Add a dashed line between verses
        const dashedLine = document.createElement('hr');
        dashedLine.classList.add('dashed-line');

        // Append the new verse, text area, and dashed line to the stacked section
        stackedVerses.appendChild(newVerseDiv);
        stackedVerses.appendChild(dashedLine);
    }
}

// Function to handle selecting a stacked verse
function selectStackedVerse(chapterNumber, verseNumber) {
    // Set the dropdowns to the correct Surah and Verse
    document.getElementById('chapterSelect').value = chapterNumber;
    fetchSurahVerses(chapterNumber).then(() => {
        document.getElementById('verseSelect').value = verseNumber;
        displayVerse(); // Display the selected verse in the top section
    });
}

// Remove a verse from the stacked section
function removeVerse(element) {
    const verseDiv = element.parentElement; // Get the verse div
    const dashedLine = verseDiv.nextElementSibling; // Get the dashed line after the verse

    verseDiv.remove(); // Remove the verse
    if (dashedLine) {
        dashedLine.remove(); // Remove the dashed line
    }
}


// Save the current state and display JSON in a new tab
function saveState() {
    const stackedVerses = document.getElementById('stackedVerses').children;
    const state = [];

    // Loop through stacked verses and save the Surah, Verse numbers, and associated text
    for (let i = 0; i < stackedVerses.length; i += 2) {
        const verseDiv = stackedVerses[i];
        const surahInfo = verseDiv.querySelector('strong').textContent.match(/Surah (\d+): .* Ayah (\d+)/);
        const textArea = verseDiv.querySelector('textarea'); // Get the associated textarea

        if (surahInfo) {
            const [_, surahNumber, verseNumber] = surahInfo;
            const verseNotes = textArea ? textArea.value : ""; // Get the notes or default to empty string
            state.push({ surahNumber, verseNumber, verseNotes });
        }
    }

    // Get the text box content
    const userInput = document.getElementById('userInput').value;

    // Save both the verses and the text box content to the state
    const fullState = {
        verses: state,
        userInput: userInput // Ensure this is saved as part of the state
    };

    // Log the full state to verify the structure
    console.log("Saved State:", fullState);

    // Convert the state to a JSON string and open it in a new tab
    const jsonData = JSON.stringify(fullState, null, 2);
    const newTab = window.open();
    newTab.document.write(`<pre>${jsonData}</pre>`);
    newTab.document.title = 'Quran State JSON';
}


// Restore the saved state (for the verses only)
async function restoreState(state) {
    // Log the state being loaded to check the structure
    console.log("Loaded State:", state);

    // Check if the state contains the correct structure
    if (state && Array.isArray(state)) {
        // Clear current stacked verses
        document.getElementById('stackedVerses').innerHTML = '';

        for (const { surahNumber, verseNumber, verseNotes } of state) {
            // Set the dropdown to the correct Surah and Verse, and add them to the stack
            document.getElementById('chapterSelect').value = surahNumber;
            await fetchSurahVerses(surahNumber); // Populate the verses for the Surah
            document.getElementById('verseSelect').value = verseNumber;
            await addVerse(); // Add the verse to the stacked section

            // After adding the verse, populate the corresponding text area with the saved notes
            const stackedVerses = document.getElementById('stackedVerses').children;
            const lastVerseDiv = stackedVerses[stackedVerses.length - 2]; // Get the last added verse div
            const textArea = lastVerseDiv.querySelector('textarea');
            if (textArea) {
                textArea.value = verseNotes || ""; // Restore the saved notes or empty string
            }
        }
    } else {
        console.error("Invalid state structure:", state);
    }
}
