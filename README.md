## 🔄 Overview of  Use Case

* **Word Source**: `words.txt` (starts with 290 words)
* **Daily Goal**: Learn 50 new words per day
* **Review System**: Use SSP-MMC-style scheduling to decide when to review each word next, based on your memory retention
* **Input**: You mark each word as **“Easy”**, **“Hard”**, or **“Forgot”**
* **Adaptivity**: The algorithm adapts per word, updating how long until the next review
* **Growth**: You add more words over time—algorithm continues scaling

---

## 🧠 What SSP-MMC Does in a Nutshell

The **SSP-MMC (Stochastic Scheduling Policy with Memory Model Calibration)** algorithm models **how quickly you forget each word** based on how well you remember it each time you review. Then it **predicts** when you're likely to forget the word and schedules the **next review right before that happens**.

It’s based on the **half-life of memory**—the amount of time it takes for you to have a 50% chance of forgetting a fact.

---

## ⏳ Step-by-Step for a Word

Let's take a word like **“lucid”**. Here's what happens:

### Day 1: First Encounter

* You see the word for the first time.
* You mark it:

  * **Easy** → it increases the memory halflife a lot
  * **Hard** → it increases it a bit
  * **Forgot** → it resets or decreases the halflife
* The system schedules the next review based on that halflife

> Example: Easy → Halflife = 1.5 days → next review = 1.5 days later

---

### Subsequent Reviews

Each time you review:

* If you **recall easily**, your memory of the word is reinforced → halflife increases (e.g., from 1.5 days to 2.25 days)
* If you **struggle**, the increase is smaller
* If you **forget**, halflife decreases or resets (back to \~1 day)

The algorithm **multiplies halflife** by a factor:

* Easy: ×1.5
* Hard: ×1.2
* Forgot: ×0.5 (or back to baseline)

It then schedules the **next review date = Today + New Halflife**

---

### Example Schedule for One Word (Marked “Easy” Each Time)

| Review | Date | Halflife | Notes      |
| ------ | ---- | -------- | ---------- |
| 1      | 5/9  | 1.0d     | First time |
| 2      | 5/10 | 1.5d     | 1.0 × 1.5  |
| 3      | 5/11 | 2.25d    | 1.5 × 1.5  |
| 4      | 5/13 | 3.38d    | 2.25 × 1.5 |
| 5      | 5/16 | 5.06d    | ...        |

Eventually, you're reviewing words only **every few weeks or months**, once they’re firmly in memory.

---

## 📅 Daily Workflow

Every day, the system will:

1. **Identify due words**:

   * From your existing review schedule
   * Anything whose review date is today or earlier
2. **Add 50 new words**

   * From the top of `words.txt` or based on a new words list
3. **Let you rate each word**: Easy / Hard / Forgot
4. **Recalculate halflife and next review date** for each word

---

## 🆕 Handling New Words

When you add more words to `words.txt`:

* The system should pick up from where you left off
* You’ll always be reviewing:

  * Due words from past days
  * Plus 50 new ones (or however many you want daily)

---

## 🧩 Tech Implementation Considerations

You’ll want:

* A **JSON or database file** to store each word's:

  * `word`, `shortdef`, `last_reviewed`, `halflife`, `next_due_date`
* A **scheduler function** that:

  * Picks due words each day
  * Updates word memory based on your feedback
* A way to **track your progress over time**, possibly even with stats/graphs

---

## 🧠 Summary

This is building a **dynamic system** that learns **how *you* learn**, using a realistic forgetting curve. SSP-MMC gives you the math to decide *when* to review a word so you remember it long-term, without wasting time reviewing too early or too late.
