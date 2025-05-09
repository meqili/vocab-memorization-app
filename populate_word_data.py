import json
import re
from datetime import datetime

DEFAULT_HALFLIFE = 1.0  # Default value for halflife
words_file_path = 'words.txt'
word_data_file_path = 'word_data.json'

# Function to remove non-printable characters (like Zero Width Space)
def clean_word(word):
    # Remove non-printable characters (e.g., '\u200a')
    cleaned_word = re.sub(r'\s+', ' ', word).strip()  # Replace multiple spaces with a single space
    cleaned_word = re.sub(r'[^\x20-\x7E]', '', cleaned_word)  # Remove non-ASCII characters
    return cleaned_word

def load_words_from_file(file_path):
    try:
        with open(file_path, 'r') as file:
            # Remove any empty lines or lines with just whitespace
            words = [line.strip() for line in file.readlines() if line.strip()]
            return words
    except FileNotFoundError:
        print(f"File {file_path} not found.")
        return []

def load_word_data(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

def save_word_data(data, file_path):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

def initialize_word_data():
    # Load existing words and word data
    words = load_words_from_file(words_file_path)
    word_data = load_word_data(word_data_file_path)

    # Add words to the word_data if they don't already exist
    for word in words:
        # Clean the word to remove any invisible characters
        cleaned_word = clean_word(word)
        
        # Skip empty words after cleaning or duplicates
        if cleaned_word and cleaned_word != "null" and cleaned_word not in word_data:
            word_data[cleaned_word] = {
                "halflife": DEFAULT_HALFLIFE,
                "last_reviewed": datetime.today().date().isoformat(),
                "next_due_date": datetime.today().date().isoformat()
            }

    # Save the updated word data to the file
    save_word_data(word_data, word_data_file_path)
    print(f"Word data has been initialized with {len(words)} words.")

# Run the initialization
initialize_word_data()