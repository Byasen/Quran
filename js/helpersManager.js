// Helper function to pad numbers with leading zeros to ensure 3-digit format for verse numbers
function padNumber(num) {
    return String(num).padStart(3, '0');
}

// Show the loading bar and status
function showLoadingStatus(message) {

}




// Hide the loading bar once loading is complete
function hideLoadingStatus() {

}





// Normalize Arabic text for consistent searching
function normalizeArabic(text) {
    return text
        .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
}






// Function to increment the verse
function incrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    const chapterNumber = document.getElementById('chapterSelect');       
    const currentVerseIndex = verseSelect.selectedIndex;
    
    if (currentVerseIndex < verseSelect.options.length - 1) {
        // Move to the next verse
        verseSelect.selectedIndex = currentVerseIndex + 1;
        displayVerseWithAnalyses();
        displayQuranPagesWithHighlight(chapterNumber.value, verseSelect.value);
    }
}

// Function to decrement the verse
function decrementVerse() {
    const verseSelect = document.getElementById('verseSelect');
    const chapterNumber = document.getElementById('chapterSelect');
    const currentVerseIndex = verseSelect.selectedIndex;
    
    if (currentVerseIndex > 0) {
        // Move to the previous verse
        verseSelect.selectedIndex = currentVerseIndex - 1;
        displayVerseWithAnalyses();
        displayQuranPagesWithHighlight(chapterNumber.value, verseSelect.value);
    }
}







function handleScroll(direction) { 
    return new Promise((resolve) => {
        const container = document.getElementById("pageResultsId");
        const start = container.scrollTop;
        let target;

        if (direction === "top") {
            target = 0;
        } else if (direction === "bottom") {
            target = container.scrollHeight - container.clientHeight;
        } else if (direction === "middle") {
            target = (container.scrollHeight - container.clientHeight) / 2;
        } else {
            resolve();
            return;
        }

        const distance = Math.abs(target - start);

        // Duration proportional to distance (e.g., 1ms per pixel), with min/max
        const duration = distance*3;

        const startTime = performance.now();

        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutQuad(progress);

            container.scrollTop = start + (target - start) * easedProgress;

            if (elapsed < duration) {
                requestAnimationFrame(step);
            } else {
                resolve(); // ✅ animation finished
            }
        }

        requestAnimationFrame(step);
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

