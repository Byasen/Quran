// Populate Surah dropdown
function populateChapters() {
    const chapterSelect = document.getElementById('chapterSelect'); // Traditional dropdown
    const dropdownSelect = document.getElementById('dropdownList'); // Custom dropdown list

    chapterSelect.innerHTML = ''; // Clear previous options
    dropdownSelect.innerHTML = ''; // Clear previous items

    quranMetadata.forEach(surah => {
        // Populate traditional dropdown
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
        chapterSelect.appendChild(option);

       // Populate custom dropdown
       const div = document.createElement('div');
       div.textContent = `${surah.number}. ${surah.name.en} (${surah.name.ar})`;
       div.setAttribute('data-value', surah.number); // Store value for reference
       
       // Call function when selection is made
       div.onclick = function () {
           document.getElementById("dropdownInput").value = this.textContent;
           document.getElementById("dropdownList").style.display = "none";
           onChapterSelect(this.getAttribute('data-value')); // Call function with chapter number
       };
       
       dropdownSelect.appendChild(div);
    });
    
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
            option.textContent = `${verse.number}`;
            verseSelect.appendChild(option);
        });

        // Auto-display the first verse
        displayVerseWithAnalyses();
    }
}
