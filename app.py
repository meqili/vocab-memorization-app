from flask import Flask, jsonify, render_template, request
from scheduler import load_word_data, save_word_data, update_word
from sspmmc import get_due_words
from populate_word_data import initialize_word_data

# Initialize word data
initialize_word_data()

app = Flask(__name__)

# Set the maximum number of words you want to review per day
MAX_WORDS_PER_DAY = 2

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-due-words', methods=['GET'])
def get_due_words_api():
    word_data = load_word_data('word_data.json')
    due_words = get_due_words(word_data)
    # Limit the due words to MAX_WORDS_PER_DAY
    limited_due_words = due_words[:MAX_WORDS_PER_DAY]
    return jsonify(limited_due_words)

@app.route('/update-word', methods=['POST'])
def update_word_route():
    data = request.get_json()
    word = data.get('word')
    feedback = data.get('feedback')

    word_data = load_word_data('word_data.json')
    word_data = update_word(word_data, word, feedback)
    save_word_data(word_data, 'word_data.json')

    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)