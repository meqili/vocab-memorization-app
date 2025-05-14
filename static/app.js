let queue = [];
let reviewHistory = {};
let lastReviewedWord = null;
import { API_URL, API_KEY } from './constants.js';  // Adjust path if necessary

async function fetchDueWords() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      queue = [...data];
      if (queue.length > 0) {
        showFlashcard();
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

async function showFlashcard() {
  const container = document.querySelector('.flashcard-container');
  if (queue.length === 0) {
    container.innerHTML = '<p class="empty">🎉 You have finished today\'s study</p>';
    return;
  }

  const word = queue[0];
  const wordData = await fetchWordDetails(word);
  container.innerHTML = '';

  if (!wordData) {
    container.innerHTML = `<p class="empty">Could not fetch data for: ${word}</p>`;
    return;
  }

  const flashcard = document.createElement('div');
  flashcard.className = 'flashcard';

  const topBar = document.createElement('div');
  topBar.className = 'top-bar';

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅️ Back';
  backBtn.className = 'nav-btn top-left';
  backBtn.onclick = () => {
    if (queue.length > 1) {
      queue.unshift(queue.pop());
      showFlashcard();
    }
  };
  backBtn.style.visibility = queue.length > 1 ? 'visible' : 'hidden';

  const homeLink = document.createElement('a');
  homeLink.href = '';
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

  const previousFeedback = (word === lastReviewedWord) ? reviewHistory[word]?.feedback : null;

  const makeReviewButton = (label, value) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'feedback-btn';
    if (previousFeedback === value) btn.classList.add('selected');
    btn.onclick = () => {
      reviewHistory[word] = { feedback: value };
      lastReviewedWord = word; // Set for back navigation

      // Remove word from queue
      queue.shift();
      if (value !== 'easy') queue.push(word); // Re-add to end if not "easy"
      showFlashcard();
      handleReviewFeedback(word, value);
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

const reviewedWords = new Set(); // track which words have been updated

function handleReviewFeedback(word, rating) {
  console.log(`Word: ${word}, Feedback: ${rating}`);

  // Only update the server the first time
  if (!reviewedWords.has(word)) {
    reviewedWords.add(word);

    fetch('/update-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, feedback: rating })
    }).catch(error => console.error('Error sending feedback:', error));
  }
}

window.addEventListener('DOMContentLoaded', fetchDueWords);
