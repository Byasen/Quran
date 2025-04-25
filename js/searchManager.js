let csvData = [];


// === Global Tracking Variables ===
let currentSearchInput = '';           // Tracks the current normalized search input
let checkedWords = [];          // Tracks currently checked words


async function loadCSVData() {
  try {
    const response = await fetch('data/quranText.csv');
    let csvText = await response.text();
    csvText = normalizeArabic(csvText.trim());

    const rows = csvText.split('\n');
    csvData = rows.slice(1).map(row => {
      const columns = row.split(',');
      if (columns.length < 6) return null;
      const [id, page, chapter, verse, text, chapterName] = columns;
      return {
        chapter: chapter.trim(),
        verse: verse.trim(),
        text: text.trim(),
        chapterName: chapterName.trim()
      };
    }).filter(entry => entry !== null);
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
  }
}

function normalizeArabic(text) {
  return text
    .replace(/\u200E/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/[ؤئء]/g, 'ء');
}

function normalizeForRootMatch(text) {
  return normalizeArabic(text)
    .replace(/[اأإآؤئء]/g, 'ء')
    .replace(/ى/g, 'ي');
}

async function getWordsFromRoots(word) {
  const response = await fetch('data/roots.json');
  const data = await response.json();
  const normalized = normalizeForRootMatch(word);
  const match = data.roots.find(r => normalizeForRootMatch(r.root) === normalized);
  return match ? match.words : [];
}


async function getRootFromWord(word) {
    const response = await fetch('data/roots.json');
    const rootsData = await response.json();
    const normalizedWord = normalizeForRootMatch(word);

    for (const rootEntry of rootsData.roots) {
        const normalizedRoot = normalizeForRootMatch(rootEntry.root);
        const words = rootEntry.words.map(w => normalizeForRootMatch(w));

        if (words.includes(normalizedWord)) {
            return rootEntry; // { root: '...', words: [...] }
        }
    }

    return null;
}


function getMatchesFromWordList(wordList) {
    const regexes = wordList.map(word =>
        new RegExp(
            `(^|\\s|\\p{P})(?<!\\w)${normalizeArabic(word)}(?!\\w)(?=$|\\s|\\p{P})`, 
            'gu' // 'u' for Unicode matching (so we can use \p{P} for punctuation), 'g' for global search
        )
    );

    return csvData.filter(entry =>
        regexes.some(regex => normalizeArabic(entry.text).match(regex))
    );
}


function displaySearchResults(label, wordList, matches, clear = true) {
    const container1 = document.getElementById('searchResultsContainer1');
    const container2 = document.getElementById('searchResultsContainer2');
  
    const normalizedLabel = normalizeArabic(label);
  
    if (clear) {
      container1.innerHTML = '';
      container2.innerHTML = '';
    }
  
    const chapterOccurrences = {};
    matches.forEach(match => {
      const div = document.createElement('div');
      div.classList.add('searchVerseResult');
      div.setAttribute('data-word', normalizedLabel);
    
      div.innerHTML = `
      <button class="select-verse-btn" style="margin-right: 10px;"
        onclick="selectThisVerse(${match.chapter}, ${match.verse})">
        اختيار
      </button>
        <strong>سورة ${match.chapterName} (${match.chapter}) (آية ${match.verse})</strong>
        <br>
        ${match.text}
      `;
    
      container2.appendChild(div);
    });
    
  }
  
function removeResultsByWord(word) {
  const blocks = document.querySelectorAll(`.searchVerseResult[data-word="${word}"]`);
  blocks.forEach(block => block.remove());
  saveStateToLocal();
}

async function searchInCSVClearCurrent() {
    const input = document.getElementById('verseSearchInput').value.trim();
    const query = normalizeArabic(input);
    checkedWords = []; 
    searchInCSV();
    if (!checkedWords.includes(query)) {
      checkedWords.push(query); // Tracks currently checked words
    }

}   


async function searchInCSV() {
  const input = document.getElementById('verseSearchInput').value.trim();
  const query = normalizeArabic(input);

  searchResultsContainer1.innerHTML = '';
  searchResultsContainer2.innerHTML = '';

  if (!query) return;

  currentSearchInput = query;

  const rootContainer = document.createElement('div');
  const seenNormalized = new Set();

  const suggestedWordsLabel = document.createElement('div');
  suggestedWordsLabel.classList.add('suggested-words-label');
  suggestedWordsLabel.textContent = 'كلمات ذات صلة';
  rootContainer.appendChild(suggestedWordsLabel);

  const normalizedQuery = normalizeArabic(query);
  if (!seenNormalized.has(normalizedQuery)) {
    seenNormalized.add(normalizedQuery);

    const mainCheckbox = document.createElement('input');
    mainCheckbox.type = 'checkbox';
    mainCheckbox.id = `rootWord-${query}`;
    mainCheckbox.value = query;
    mainCheckbox.checked = true;
 
    const initialMatches = getMatchesFromWordList([query]);

    const mainLabel = document.createElement('label');
    mainLabel.htmlFor = `rootWord-${query}`;
    mainLabel.textContent = `${query} [${initialMatches.length}]`;

    rootContainer.appendChild(mainLabel);
    rootContainer.appendChild(mainCheckbox);
    rootContainer.appendChild(document.createElement('br'));

    displaySearchResults(query, [query], initialMatches, false);

    mainCheckbox.addEventListener('change', function () {
      if (this.checked) {
        if (!checkedWords.includes(query)) {
          checkedWords.push(query); // Tracks currently checked words
        }    
        const matches = getMatchesFromWordList([query]);
        displaySearchResults(query, [query], matches, false);
        saveStateToLocal();
      } else {
        const index = checkedWords.indexOf(query);
        if (index > -1) {
          checkedWords.splice(index, 1);
        }
        const blocks = document.querySelectorAll(`.searchVerseResult[data-word="${normalizedQuery}"]`);
        blocks.forEach(block => block.remove());
        saveStateToLocal();
      }
    });
  }

  let rootEntry;
  try {
    rootEntry = await getRootFromWord(query);
  } catch (error) {
    return;
  }

  if (rootEntry && rootEntry.words.length > 1) {
    const otherWords = rootEntry.words.filter(w => normalizeArabic(w) !== normalizedQuery);

    for (const word of otherWords) {
      const normalizedWord = normalizeArabic(word);
      if (!seenNormalized.has(normalizedWord)) {
        seenNormalized.add(normalizedWord);

        const matches = getMatchesFromWordList([word]);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `rootWord-${word}`;
        checkbox.value = word;

        const label = document.createElement('label');
        label.htmlFor = `rootWord-${word}`;
        label.textContent = `${word} [${matches.length}]`;

        checkbox.addEventListener('change', function () {
          if (this.checked) {
            if (!checkedWords.includes(word)) {
              checkedWords.push(word); // Tracks currently checked words
            }    
            displaySearchResults(word, [word], matches, false);
            saveStateToLocal();
          } else {
            const index = checkedWords.indexOf(word);
            if (index > -1) {
              checkedWords.splice(index, 1);
            }
            const blocks = document.querySelectorAll(`.searchVerseResult[data-word="${normalizedWord}"]`);
            blocks.forEach(block => block.remove());
            saveStateToLocal();
          }
        });

        rootContainer.appendChild(label);
        rootContainer.appendChild(checkbox);
        rootContainer.appendChild(document.createElement('br'));
      }
    }
  }

  searchResultsContainer1.appendChild(rootContainer);
  saveStateToLocal();
}
