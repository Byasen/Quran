// Helper function to pad numbers with leading zeros to ensure 3-digit format for verse numbers
function padNumber(num) {
    return String(num).padStart(3, '0');
}

// Append the file path being fetched (for debugging) to the existing log (hidden by default)
function appendFilePath(filePath) {
    const filePathDisplay = document.getElementById('filePathDisplay');
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.innerHTML = `Fetching from: ${filePath}`;
    filePathDisplay.style.display = 'none'; // Hide by default
    filePathDisplay.appendChild(logEntry);  // Append to the log section
}

// Append an error message to the existing error log (hidden by default)
function appendError(message) {
    const verseDisplay = document.getElementById('verseDisplay');
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.textContent = message;
    verseDisplay.style.display = 'none'; // Hide by default
    verseDisplay.appendChild(logEntry);  // Append to the log section
}
