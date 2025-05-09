let currentWordIndex = 0;
let wordsList = [];
let reviewHistory = [];

const API_KEY = 'b15646b3-c1c4-4fcf-9332-22fa13b495a5';
const API_URL = 'http://127.0.0.1:5000/get-due-words';

async function fetchDueWords() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      wordsList = await response.json();
      if (wordsList.length > 0) {
        showFlashcard(currentWordIndex);
      } else {
        document.querySelector('.flashcard-container').innerHTML = '<p class="empty">No due words today! 🎉</p>';
      }
    } else {
      console.error('Failed to fetch due words');
    }
  } catch (err) {
    console.error('Error fetching due words:', err);
  }
}

async function fetchWordDetails(word) {
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data) && typeof data[0] !== 'string' ? data[0] : null;
  } catch (err) {
    console.error('Error fetching definition:', err);
    return null;
  }
}

function getAudioUrl(prs) {
  if (!prs || !prs[0]?.sound?.audio) return null;
  const audio = prs[0].sound.audio;
  let subdir = /^[0-9]/.test(audio) ? 'number' : audio.startsWith('bix') ? 'bix' : audio.startsWith('gg') ? 'gg' : audio.charAt(0);
  return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audio}.mp3`;
}

function parseShortDef(defArr) {
  return defArr.map((def, index) => `${index + 1}. ${def}`);
}

async function showFlashcard(index) {
  const container = document.querySelector('.flashcard-container');
  if (index >= wordsList.length) {
    container.innerHTML = '<p class="empty">🎉 You have finished today\'s study</p>';
    return;
  }

  const word = wordsList[index];
  const wordData = await fetchWordDetails(word);
  container.innerHTML = '';

  if (!wordData) {
    container.innerHTML = `<p class="empty">Could not fetch data for: ${word}</p>`;
    return;
  }

  const flashcard = document.createElement('div');
  flashcard.className = 'flashcard';

  // Header container for nav controls
  const topBar = document.createElement('div');
  topBar.className = 'top-bar';

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅️ Back';
  backBtn.className = 'nav-btn top-left';
  backBtn.onclick = () => {
    if (currentWordIndex > 0) {
      currentWordIndex--;
      showFlashcard(currentWordIndex);
    }
  };
  backBtn.style.visibility = currentWordIndex === 0 ? 'hidden' : 'visible';

  const homeLink = document.createElement('a');
  homeLink.href = ''; // leave empty for now
  homeLink.textContent = '🏠 Return to Home Page';
  homeLink.className = 'top-right';

  topBar.append(backBtn, homeLink);

  const headword = document.createElement('h3');
  headword.textContent = (wordData.hwi?.hw || wordData.meta.id).replace(/\*/g, '');

  const fl = document.createElement('p');
  fl.textContent = wordData.fl || '';

  const audioUrl = getAudioUrl(wordData.hwi?.prs);
  const audioBtn = document.createElement('button');
  audioBtn.textContent = '🔊 Audio';
  audioBtn.className = 'action';
  audioBtn.onclick = () => audioUrl && new Audio(audioUrl).play();

  const defBtn = document.createElement('button');
  defBtn.textContent = '📖 Show Definition';
  defBtn.className = 'action';

  const defBox = document.createElement('div');
  defBox.className = 'details';

  defBtn.onclick = () => {
    if (!defBox.innerHTML) {
      const shortDefs = parseShortDef(wordData.shortdef);
      defBox.innerHTML = shortDefs.map(d => `<p>${d}</p>`).join('');
    }
    defBox.classList.toggle('visible');
  };

  const feedbackContainer = document.createElement('div');
  feedbackContainer.className = 'feedback';

  const previousFeedback = reviewHistory[index]?.feedback;

  const makeReviewButton = (label, value) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'feedback-btn';
    if (previousFeedback === value) {
      btn.classList.add('selected');
    }
    btn.onclick = () => {
      reviewHistory[index] = { word, feedback: value };
      handleReviewFeedback(word, value);
      currentWordIndex++;
      showFlashcard(currentWordIndex);
    };
    return btn;
  };

  feedbackContainer.append(
    makeReviewButton('✅ Easy', 'easy'),
    makeReviewButton('⚠️ Hard', 'hard'),
    makeReviewButton('❌ Forgot', 'forgot')
  );

  flashcard.append(topBar, headword, fl, audioBtn, defBtn, defBox, feedbackContainer);
  container.appendChild(flashcard);
}

function handleReviewFeedback(word, rating) {
  console.log(`Word: ${word}, Feedback: ${rating}`);
  fetch('/update-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, feedback: rating })
  }).catch(error => console.error('Error sending feedback:', error));
}

window.addEventListener('DOMContentLoaded', fetchDueWords);
