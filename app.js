// Enhanced app.js using full Merriam-Webster API data structure

let currentWordIndex = 0;
let wordsList = [];

const API_KEY = 'b15646b3-c1c4-4fcf-9332-22fa13b495a5'; // Replace with your own key

// Fetch words from file
async function fetchWords() {
  try {
    const response = await fetch('words.txt');
    const text = await response.text();
    return text.split('\n').map(w => w.trim()).filter(Boolean);
  } catch (err) {
    console.error('Failed to fetch words:', err);
    return [];
  }
}

// Fetch full dictionary entry
async function fetchWordDetails(word) {
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data) && typeof data[0] !== 'string') {
      return data[0];
    } else {
      console.warn('Suggestions:', data);
      return null;
    }
  } catch (err) {
    console.error('Error fetching definition:', err);
    return null;
  }
}

// Get audio URL
function getAudioUrl(prs) {
  if (!prs || prs.length === 0) return null;
  const audio = prs[0].sound?.audio;
  if (!audio) return null;

  let subdir = 'number';
  if (/^bix/.test(audio)) subdir = 'bix';
  else if (/^gg/.test(audio)) subdir = 'gg';
  else if (/^[0-9]/.test(audio)) subdir = 'number';
  else subdir = audio.charAt(0);

  return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audio}.mp3`;
}

// Parse full definitions with examples
function parseDefinitions(defArr) {
  const output = [];
  defArr.forEach(defBlock => {
    defBlock.sseq.forEach(sseq => {
      sseq.forEach(sense => {
        if (sense[0] === 'sense') {
          const senseData = sense[1];
          const sn = senseData.sn ? `${senseData.sn}. ` : '';

          const dt = senseData.dt || [];
          dt.forEach(item => {
            if (item[0] === 'text') {
              const clean = item[1].replace(/{.*?}/g, '');
              output.push(sn + clean);
            } else if (item[0] === 'vis') {
              item[1].forEach(eg => {
                output.push(`Example: ${eg.t.replace(/{.*?}/g, '')}`);
              });
            }
          });
        }
      });
    });
  });
  return output;
}

// Initialize a flashcard
async function showFlashcard(index) {
  const word = wordsList[index];
  const wordData = await fetchWordDetails(word);
  const container = document.querySelector('.flashcard-container');
  container.innerHTML = '';

  if (!wordData) {
    container.innerHTML = `<p>Could not fetch data for: ${word}</p>`;
    return;
  }

  const flashcard = document.createElement('div');
  flashcard.className = 'flashcard';

  const headword = document.createElement('h3');
  headword.textContent = (wordData.hwi?.hw || wordData.meta.id).replace(/\*/g, '');
  headword.className = 'centered-text';

  const fl = document.createElement('p');
  fl.textContent = wordData.fl || '';
  fl.className = 'centered-text';

  const audioUrl = getAudioUrl(wordData.hwi?.prs);
  const audioBtn = document.createElement('button');
  audioBtn.textContent = '🔊 Play Audio';
  audioBtn.onclick = () => audioUrl && new Audio(audioUrl).play();

  const defBtn = document.createElement('button');
  defBtn.textContent = '📖 Show Definition';
  const defBox = document.createElement('div');
  defBox.style.display = 'none';
  defBox.className = 'details';
  defBtn.onclick = () => {
    if (defBox.innerHTML === '') {
      const defs = parseDefinitions(wordData.def);
      defBox.innerHTML = defs.map(d => `<p>${d}</p>`).join('');
    }
    defBox.style.display = defBox.style.display === 'none' ? 'block' : 'none';
  };  

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '➡️ Next';
  nextBtn.onclick = () => {
    if (currentWordIndex < wordsList.length - 1) {
      currentWordIndex++;
      showFlashcard(currentWordIndex);
    } else {
      container.innerHTML = '<p>🎉 You have finished todays study</p>';
    }
  };

  flashcard.append(headword, fl, audioBtn, defBtn, defBox, nextBtn);
  container.appendChild(flashcard);
}

// Startup
window.addEventListener('DOMContentLoaded', async () => {
  wordsList = await fetchWords();
  if (wordsList.length > 0) {
    showFlashcard(currentWordIndex);
  } else {
    document.querySelector('.flashcard-container').innerHTML = '<p>No words found.</p>';
  }
});
