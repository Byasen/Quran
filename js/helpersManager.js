// Helper function to pad numbers with leading zeros to ensure 3-digit format for verse numbers
function padNumber(num) {
    return String(num).padStart(3, '0');
}

// Show the loading bar and status
function showLoadingStatus(message) {
    const loadingBar = document.getElementById('loadingBarId');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingBarContainer = document.getElementById('loadingBarContainerId');

    loadingBarContainer.style.display = 'block';

    // Simulate progress (for demonstration, you can adjust it)
    loadingBar.value += 10;
    if (loadingBar.value > 100) loadingBar.value = 0; // Reset if it exceeds 100
}




// Hide the loading bar once loading is complete
function hideLoadingStatus() {
    const loadingBarContainer = document.getElementById('loadingBarContainerId');
    loadingBarContainer.style.display = 'none';
}





// Normalize Arabic text for consistent searching
function normalizeArabic(text) {
    return text
        .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
}







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

function handleScrollMid() {
    const container = document.getElementById("pageResultsId");
    const images = container.querySelectorAll("img");

    // Wait for all images to load
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = img.onerror = () => resolve();
        });
    });

    Promise.all(imagePromises).then(() => {
        // Use requestAnimationFrame to ensure layout is updated
        requestAnimationFrame(() => {
            if (container.scrollHeight > container.clientHeight) {
                container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
            }
        });
    });
}



// Select a random word from the 5th column of the Quran CSV and search for it
async function selectRandomWordAndSearch() {
    const response = await fetch('data/quranText.csv');
    const csvText = await response.text();
    const rows = csvText.split('\n'); // Split by newlines to get rows

    const words = rows
        .map(row => {
            const columns = row.split(',');
            return columns[4] ? columns[4].trim() : ''; // Get the 5th column (index 4)
        })
        .filter(word => word) // Remove empty values
        .flatMap(word => word.split(' ')); // Split into individual words

    if (words.length === 0) {
        //console.error("No words found in the 5th column.");
        return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];

    let field = document.getElementById("verseSearchInput");
    field.value = randomWord;
    searchInCSV();
}

