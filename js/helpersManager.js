// Helper function to pad numbers with leading zeros to ensure 3-digit format for verse numbers
function padNumber(num) {
    return String(num).padStart(3, '0');
}

// Append the file path being fetched (for debugging) to the existing log (now in red box)
function appendFilePath(filePath) {
    const filePathDisplay = document.getElementById('filePathDisplay');
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.innerHTML = `Fetching from: ${filePath}`;
    //filePathDisplay.style.display = 'block'; // Show the log box
    filePathDisplay.style.display = 'none'; // Hide the log box
    filePathDisplay.appendChild(logEntry);  // Append to the log section
}

// Append an error message to the existing error log (now in red box)
function appendError(message) {
    const filePathDisplay = document.getElementById('filePathDisplay');
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.textContent = message;
    //filePathDisplay.style.display = 'block'; // Show the log box
    filePathDisplay.style.display = 'none'; // Hide the log box
    filePathDisplay.appendChild(logEntry);  // Append to the log section
}


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


// Normalize Arabic text for consistent searching
function normalizeArabic(text) {
    return text
        .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
}



// Decrement Quran page
function decrementPage() {
    const pageSelect = document.getElementById('pageSelect');
    const currentIndex = pageSelect.selectedIndex;

    if (currentIndex > 0) {
        pageSelect.selectedIndex = currentIndex - 1;
        onPageChange();
    }
}




// Increment Quran page
function incrementPage() {
    const pageSelect = document.getElementById('pageSelect');
    const currentIndex = pageSelect.selectedIndex;

    if (currentIndex < pageSelect.options.length - 1) {
        pageSelect.selectedIndex = currentIndex + 1;
        onPageChange();
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

function scrollMid() {
let container = document.getElementById("pageScroll");
requestAnimationFrame(() => {
console.log("Before scroll:", document.getElementById("pageScroll").scrollTop);
document.getElementById("pageScroll").scrollTop = 485;
console.log("After scroll:", document.getElementById("pageScroll").scrollTop);
});
}