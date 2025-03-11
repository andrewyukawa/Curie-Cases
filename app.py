from flask import Flask, render_template, request, jsonify, redirect, url_for
import db
import os

app = Flask(__name__)

# Initialize database
if not os.path.exists('curie.db'):
    db.init_db()

@app.route('/')
def home():
    """Render homepage with all lessons"""
    lessons = db.get_lessons()
    return render_template('index.html', lessons=lessons)

@app.route('/lesson/<int:lesson_id>')
def lesson(lesson_id):
    """Render a specific lesson page"""
    lesson = db.get_lesson(lesson_id)
    if not lesson:
        return redirect(url_for('home'))
    return render_template('lesson.html', lesson=lesson)

@app.route('/api/lessons', methods=['GET'])
def api_lessons():
    """API endpoint to get all lessons"""
    lessons = db.get_lessons()
    return jsonify({'lessons': lessons})

@app.route('/api/lesson/<int:lesson_id>', methods=['GET'])
def api_lesson(lesson_id):
    """API endpoint to get questions for a specific lesson"""
    questions = db.get_lesson_questions(lesson_id)
    return jsonify({'questions': questions})

@app.route('/api/lesson/<int:lesson_id>/submit', methods=['POST'])
def submit_answer(lesson_id):
    """API endpoint to submit an answer and get feedback"""
    data = request.json
    question_id = data.get('question_id')
    answer = data.get('answer')
    
    is_correct, explanation, next_question_id = db.check_answer(question_id, answer)
    
    return jsonify({
        'is_correct': is_correct,
        'explanation': explanation,
        'next_question_id': next_question_id
    })

# Updated for Vercel deployment
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None',
)

if __name__ == '__main__':
    app.run(debug=True) 