# sspmmc.py
from datetime import datetime

def get_due_words(word_data):
    today = datetime.today().date()
    due_words = [
        word for word, data in word_data.items()
        if datetime.fromisoformat(data['next_due_date']).date() <= today
    ]
    return due_words
