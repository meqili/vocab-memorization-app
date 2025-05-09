# scheduler.py
import json
from datetime import datetime, timedelta

DEFAULT_HALFLIFE = 1.0  # in days
EASY_MULTIPLIER = 2.5
HARD_MULTIPLIER = 1.2
FORGOT_MULTIPLIER = 0.5


def load_word_data(file_path='word_data.json'):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def save_word_data(data, file_path='word_data.json'):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)


def update_word(word_data, word, feedback):
    today = datetime.today().date().isoformat()
    entry = word_data.get(word, {
        'halflife': DEFAULT_HALFLIFE,
        'last_reviewed': today,
        'next_due_date': today
    })

    # Update halflife based on feedback
    if feedback == 'easy':
        entry['halflife'] *= EASY_MULTIPLIER
    elif feedback == 'hard':
        entry['halflife'] *= HARD_MULTIPLIER
    elif feedback == 'forgot':
        entry['halflife'] *= FORGOT_MULTIPLIER

    entry['last_reviewed'] = today
    next_due = datetime.today() + timedelta(days=entry['halflife'])
    entry['next_due_date'] = next_due.date().isoformat()

    word_data[word] = entry
    return word_data