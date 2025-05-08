// app.js

let currentIndex = 0;
let words = [];

// Function to fetch the words from the words.txt file
async function fetchWords() {
  try {
    const response = await fetch('words.txt');
    const text = await response.text();
    return text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}

// Function to fetch word details (synonyms, definitions, example)
async function fetchWordDetails(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0]; // First entry
  } catch (error) {
    console.error('Error fetching word details:', error);
    return null;
  }
}

// Function to play audio (if available)
function playAudio(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play();
}

// Function to create a single flashcard
async function createFlashcard(word) {
  const flashcardContainer = document.querySelector('.flashcard-container');
  flashcardContainer.innerHTML = ''; // Clear existing card

  const wordData = await fetchWordDetails(word);
  if (!wordData) {
    flashcardContainer.innerHTML = `<p>Could not fetch data for: ${word}</p>`;
    return;
  }

  const flashcard = document.createElement('div');
  flashcard.classList.add('flashcard');

  const wordElement = document.createElement('h3');
  wordElement.innerText = wordData.word;

  const synonyms = wordData.meanings[0]?.synonyms || [];
  const synonymsElement = document.createElement('p');
  synonymsElement.innerText = 'Synonyms: ' + (synonyms.length ? synonyms.join(', ') : 'None');

  const def = wordData.meanings[0]?.definitions[0];
  const definitionElement = document.createElement('p');
  definitionElement.classList.add('definition');
  definitionElement.innerText = 'Definition: ' + (def?.definition || 'N/A');
  definitionElement.style.display = 'none';

  const exampleElement = document.createElement('p');
  exampleElement.classList.add('example');
  exampleElement.innerText = 'Example: ' + (def?.example || 'N/A');
  exampleElement.style.display = 'none';

  const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;

  const audioButton = document.createElement('button');
  audioButton.innerText = audioUrl ? 'Play Audio' : 'No Audio';
  audioButton.disabled = !audioUrl;
  if (audioUrl) {
    audioButton.onclick = () => playAudio(audioUrl);
  }

  const showDefButton = document.createElement('button');
  showDefButton.innerText = 'Show Definition';
  showDefButton.onclick = () => {
    definitionElement.style.display = 'block';
    exampleElement.style.display = 'block';
    showDefButton.disabled = true;
  };

  const nextButton = document.createElement('button');
  nextButton.innerText = 'Next Word';
  nextButton.onclick = () => showNextFlashcard();

  flashcard.appendChild(wordElement);
  flashcard.appendChild(synonymsElement);
  flashcard.appendChild(audioButton);
  flashcard.appendChild(showDefButton);
  flashcard.appendChild(nextButton);
  flashcard.appendChild(definitionElement);
  flashcard.appendChild(exampleElement);

  flashcardContainer.appendChild(flashcard);
}

// Function to show the next flashcard
function showNextFlashcard() {
  currentIndex++;
  if (currentIndex >= words.length) {
    document.querySelector('.flashcard-container').innerHTML = '<p>All done for today!</p>';
    return;
  }
  createFlashcard(words[currentIndex]);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  words = await fetchWords();
  if (words.length > 0) {
    createFlashcard(words[0]);
  } else {
    document.querySelector('.flashcard-container').innerHTML = '<p>No words found.</p>';
  }
});
