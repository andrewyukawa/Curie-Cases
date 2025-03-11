import sqlite3
import json
import os

DATABASE_PATH = 'curie.db'

def get_db_connection():
    """Create a connection to the SQLite database"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with schema and sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL,
        FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    )
    ''')
    
    # Insert lessons
    lessons = [
        (1, 'Differential Diagnosis of Chest Pain'),
        (2, 'Managing Type 2 Diabetes Complications'),
        (3, 'Interpreting Abnormal Lab Results')
    ]
    cursor.executemany('INSERT INTO lessons (id, name) VALUES (?, ?)', lessons)
    
    # Insert questions for Lesson 1: Chest Pain
    questions = [
        (1, 1, 'mcq', 'A 45-year-old male presents with substernal chest pain radiating to the left arm. EKG shows ST elevation. What is the most likely diagnosis?', 
         json.dumps(["Acute MI", "Pericarditis", "Pneumothorax", "GERD"]), 
         'Acute MI', 
         'ST elevation on EKG strongly suggests an acute myocardial infarction.'),
        
        (2, 1, 'case_study', 'A 60-year-old female with a smoking history reports chest pain worsened by deep breathing. Which test should you order first?', 
         json.dumps(["Chest X-ray", "ECG", "D-dimer", "Troponin"]), 
         'Chest X-ray', 
         'Pain with breathing in a smoker suggests a pulmonary cause like pneumothorax or pleuritis.'),
        
        (3, 1, 'fill_in', 'The classic triad of ______ includes chest pain, hypotension, and unequal pulses.', 
         None, 
         'Aortic dissection', 
         'Aortic dissection is a medical emergency requiring urgent imaging.'),
        
        (4, 1, 'mcq', 'A 30-year-old female has chest pain worse with movement but no fever. What\'s the least likely cause?', 
         json.dumps(["Pneumonia", "Costochondritis", "Pericarditis", "GERD"]), 
         'Pneumonia', 
         'Pneumonia typically includes fever and respiratory symptoms.'),
        
        (5, 1, 'true_false', 'Costochondritis typically presents with reproducible pain on palpation.', 
         json.dumps(["True", "False"]), 
         'True', 
         'Reproducible pain is a hallmark of musculoskeletal causes like costochondritis.')
    ]
    
    # Insert questions for Lesson 2: Diabetes
    questions.extend([
        (6, 2, 'mcq', 'A patient with T2DM presents with numbness and tingling in the feet. What is the most likely complication?', 
         json.dumps(["Peripheral neuropathy", "Nephropathy", "Retinopathy"]), 
         'Peripheral neuropathy', 
         'Distal sensory symptoms are classic for diabetic neuropathy.'),
        
        (7, 2, 'case_study', 'A 55-year-old male with T2DM has an HbA1c of 9.5%. Which medication should you add?', 
         json.dumps(["Metformin", "GLP-1 agonist", "Sulfonylurea", "DPP-4 inhibitor"]), 
         'GLP-1 agonist', 
         'GLP-1 agonists improve glycemic control and promote weight loss in poorly controlled T2DM.'),
        
        (8, 2, 'fill_in', 'The target blood pressure for a diabetic patient is ______ mmHg.', 
         None, 
         '<130/80', 
         'Tight BP control reduces microvascular complications.'),
        
        (9, 2, 'mcq', 'How often should diabetic retinopathy screening occur for T2DM patients?', 
         json.dumps(["Annually", "Every 2 years", "Every 5 years"]), 
         'Annually', 
         'Annual screening detects early retinopathy.'),
        
        (10, 2, 'true_false', 'Metformin is contraindicated in patients with an eGFR <30 mL/min.', 
         json.dumps(["True", "False"]), 
         'True', 
         'Risk of lactic acidosis increases with low eGFR.')
    ])
    
    # Insert questions for Lesson 3: Lab Results
    questions.extend([
        (11, 3, 'mcq', 'A patient has a sodium level of 125 mEq/L. What is the most likely cause?', 
         json.dumps(["SIADH", "Dehydration", "Heart failure"]), 
         'SIADH', 
         'Hyponatremia with euvolemia suggests SIADH.'),
        
        (12, 3, 'case_study', 'A 70-year-old female has a hemoglobin of 9 g/dL and MCV of 70 fL. What\'s the next step?', 
         json.dumps(["Order iron studies", "Start B12 supplementation", "Refer to hematology"]), 
         'Order iron studies', 
         'Microcytic anemia suggests iron deficiency; confirm with labs.'),
        
        (13, 3, 'fill_in', 'A BUN/Creatinine ratio >20 suggests ______ renal failure.', 
         None, 
         'Prerenal', 
         'Elevated ratio indicates reduced renal perfusion.'),
        
        (14, 3, 'mcq', 'A patient has ALT 200 U/L and AST 150 U/L. What\'s the next step?', 
         json.dumps(["Order hepatitis panel", "Ultrasound", "Repeat labs in 1 month"]), 
         'Order hepatitis panel', 
         'Elevated transaminases suggest liver injury; screen for viral causes.'),
        
        (15, 3, 'true_false', 'A TSH of 0.1 mIU/L with elevated T4 indicates hypothyroidism.', 
         json.dumps(["True", "False"]), 
         'False', 
         'Low TSH with high T4 indicates hyperthyroidism.')
    ])
    
    cursor.executemany('''
    INSERT INTO questions (id, lesson_id, type, question_text, options, correct_answer, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', questions)
    
    conn.commit()
    conn.close()
    
    print("Database initialized with sample data.")

def get_lessons():
    """Get all lessons from the database"""
    conn = get_db_connection()
    lessons = conn.execute('SELECT id, name FROM lessons').fetchall()
    conn.close()
    return [dict(lesson) for lesson in lessons]

def get_lesson(lesson_id):
    """Get a specific lesson by ID"""
    conn = get_db_connection()
    lesson = conn.execute('SELECT id, name FROM lessons WHERE id = ?', (lesson_id,)).fetchone()
    conn.close()
    return dict(lesson) if lesson else None

def get_lesson_questions(lesson_id):
    """Get all questions for a specific lesson"""
    conn = get_db_connection()
    questions = conn.execute('''
    SELECT id, type, question_text, options, explanation
    FROM questions
    WHERE lesson_id = ?
    ORDER BY id
    ''', (lesson_id,)).fetchall()
    conn.close()
    
    result = []
    for q in questions:
        question_dict = dict(q)
        if question_dict['options']:
            question_dict['options'] = json.loads(question_dict['options'])
        result.append(question_dict)
    
    return result

def check_answer(question_id, user_answer):
    """Check if the provided answer is correct"""
    conn = get_db_connection()
    question = conn.execute('''
    SELECT id, lesson_id, correct_answer, explanation
    FROM questions
    WHERE id = ?
    ''', (question_id,)).fetchone()
    
    if not question:
        conn.close()
        return False, "Question not found", None
    
    is_correct = user_answer.strip().lower() == question['correct_answer'].strip().lower()
    
    # Get the next question ID
    next_question = conn.execute('''
    SELECT id FROM questions
    WHERE lesson_id = ? AND id > ?
    ORDER BY id ASC LIMIT 1
    ''', (question['lesson_id'], question_id)).fetchone()
    
    conn.close()
    
    next_question_id = next_question['id'] if next_question else None
    
    return is_correct, question['explanation'], next_question_id 