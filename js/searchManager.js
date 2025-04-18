let csvData = [];

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
    .replace(/ى/g, 'ي')
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

  if (clear) {
    container1.innerHTML = '';
    container2.innerHTML = '';
  }

  const chapterOccurrences = {};
  matches.forEach(match => {
    if (!chapterOccurrences[match.chapter]) {
      chapterOccurrences[match.chapter] = { count: 0, name: match.chapterName };
    }
    chapterOccurrences[match.chapter].count++;
  });

  if (clear) {
    const summary = document.createElement('div');
    summary.classList.add('search-summary');
    summary.innerHTML = `
      <p><strong>الكلمات المبحوثة:</strong> ${wordList.join(', ')}</p>
      <p><strong>السور التي وردت فيها:</strong></p>
      <ul>
        ${Object.entries(chapterOccurrences).map(([chapter, { count, name }]) =>
          `<li>سورة ${name}: ${count} مرات</li>`).join('')}
      </ul>`;
    container1.appendChild(summary);
  }

  matches.forEach(match => {
    const div = document.createElement('div');
    div.classList.add('searchVerseResult');
    div.setAttribute('data-word', label);
    div.innerHTML = `
      <strong>سورة ${match.chapterName} (${match.chapter}) (آية ${match.verse})</strong><br>
      ${match.text}
    `;
    container2.appendChild(div);
  });
}

function removeResultsByWord(word) {
  const blocks = document.querySelectorAll(`.searchVerseResult[data-word="${word}"]`);
  blocks.forEach(block => block.remove());
}

async function searchInCSV() {
  const query = normalizeArabic(document.getElementById('verseSearchInput').value.trim());
  const container1 = document.getElementById('searchResultsContainer1');
  const container2 = document.getElementById('searchResultsContainer2');

  container1.innerHTML = '';
  container2.innerHTML = '';

  if (!query) {
    container1.innerHTML = '<p>الرجاء إدخال نص للبحث.</p>';
    return;
  }

  const wordList = [query];
  const initialMatches = getMatchesFromWordList(wordList);
  displaySearchResults(query, wordList, initialMatches);

  let rootWords = [];
  try {
    rootWords = await getWordsFromRoots(query);
    rootWords = rootWords.filter(word => word !== query);
  } catch (error) {
    container1.innerHTML += '<p>فشل في تحميل الجذور.</p>';
    return;
  }

  if (rootWords.length > 0) {
    const rootContainer = document.createElement('div');
    rootContainer.innerHTML = `<p><strong>كلمات من نفس الجذر:</strong></p>`;

    rootWords.forEach(word => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `rootWord-${word}`;
      checkbox.value = word;

      checkbox.addEventListener('change', function () {
        if (this.checked) {
          const matches = getMatchesFromWordList([word]);
          displaySearchResults(word, [word], matches, false);
        } else {
          removeResultsByWord(word);
        }
      });

      const label = document.createElement('label');
      label.htmlFor = `rootWord-${word}`;
      label.textContent = word;

      rootContainer.appendChild(checkbox);
      rootContainer.appendChild(label);
      rootContainer.appendChild(document.createElement('br'));
    });

    container1.appendChild(rootContainer);
  }
}
