import sys
import requests

def load_words(file_path):
    with open(file_path, 'r') as f:
        return [word.strip() for word in f if word.strip()]

def is_valid_word(word):
    url = f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}'
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        return isinstance(data, list) and data[0].get("meanings")
    except Exception as e:
        print(f"Error checking '{word}': {e}")
        return False

def check_words(file_path):
    words = load_words(file_path)
    invalid_words = [word for word in words if not is_valid_word(word)]
    
    print("\n❌ Invalid Words:")
    for word in invalid_words:
        print(f"- {word}")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python checkWords.py words.txt")
    else:
        check_words(sys.argv[1])
