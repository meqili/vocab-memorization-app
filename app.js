// app.js

// Function to fetch the words from the words.txt file
async function fetchWords() {
  try {
    const response = await fetch('words.txt');
    const text = await response.text();
    // Split the text into an array of words
    const words = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
    return words;
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
    return data[0]; // Get the first entry
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

// Function to create flashcards dynamically
async function createFlashcards() {
  // Fetch words from words.txt
  const words = await fetchWords();
  const flashcardContainer = document.querySelector('.flashcard-container');
  
  for (const word of words) {
    const wordData = await fetchWordDetails(word);

    if (wordData) {
      const flashcard = document.createElement('div');
      flashcard.classList.add('flashcard');

      // Word & Synonyms
      const wordElement = document.createElement('h3');
      wordElement.innerText = wordData.word;

      const synonymsElement = document.createElement('p');
      synonymsElement.innerText = 'Synonyms: ' + wordData.meanings[0].synonyms.join(', ');

      // Audio button
      const audioButton = document.createElement('button');
      audioButton.innerText = 'Play Audio';
      audioButton.onclick = () => playAudio(wordData.phonetics[0]?.audio);

      // Definition & Example
      const definitionElement = document.createElement('p');
      definitionElement.classList.add('definition');
      definitionElement.innerText = 'Definition: ' + wordData.meanings[0].definitions[0].definition;

      const exampleElement = document.createElement('p');
      exampleElement.classList.add('example');
      exampleElement.innerText = 'Example: ' + wordData.meanings[0].definitions[0].example;

      flashcard.appendChild(wordElement);
      flashcard.appendChild(synonymsElement);
      flashcard.appendChild(audioButton);
      flashcard.appendChild(definitionElement);
      flashcard.appendChild(exampleElement);

      // Toggle the definition and example when clicked
      flashcard.onclick = () => {
        definitionElement.classList.toggle('definition');
        exampleElement.classList.toggle('example');
      };

      flashcardContainer.appendChild(flashcard);
    }
  }
}

// Initialize the app
createFlashcards();
