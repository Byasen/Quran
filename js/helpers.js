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
//   filePathDisplay.style.display = 'block'; // Show the log box
filePathDisplay.style.display = 'none'; // Hide the log box
    filePathDisplay.appendChild(logEntry);  // Append to the log section
}

// Append an error message to the existing error log (now in red box)
function appendError(message) {
    const filePathDisplay = document.getElementById('filePathDisplay');
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.textContent = message;
//   filePathDisplay.style.display = 'block'; // Show the log box
    filePathDisplay.style.display = 'none'; // Hide the log box
    filePathDisplay.appendChild(logEntry);  // Append to the log section
}
