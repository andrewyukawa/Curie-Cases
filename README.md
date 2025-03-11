# Curie - Medical Learning Platform

Curie is a web-based, gamified learning platform designed to enhance primary care physicians' clinical knowledge and decision-making skills through interactive lessons. This application is a proof-of-concept (PoC) inspired by the learning mechanics of Duolingo, but focused on medical education.

## Features

- **Interactive Lessons**: Three lessons with five questions each covering different medical topics:
  - Differential Diagnosis of Chest Pain
  - Managing Type 2 Diabetes Complications
  - Interpreting Abnormal Lab Results

- **Varied Question Types**:
  - Multiple Choice Questions (MCQ)
  - True/False Questions
  - Fill-in-the-blank Questions
  - Case Studies

- **Gamification Elements**:
  - Hearts System (3 hearts per lesson)
  - XP Points (10 XP per correct answer)
  - Streak Counter
  - Progress Tracking

- **Immediate Feedback**: Detailed explanations after each answer to enhance learning

## Technology Stack

- **Backend**: Python with Flask
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Styling**: Bootstrap 5

## Getting Started

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. Clone this repository or download the files

2. Navigate to the project directory
   ```
   cd curie
   ```

3. Install the required dependencies
   ```
   pip install -r requirements.txt
   ```

4. Run the application
   ```
   python app.py
   ```

5. Open your web browser and navigate to
   ```
   http://localhost:5000
   ```

## Application Structure

- `/static` - Contains CSS and JavaScript files
- `/templates` - Contains HTML templates
- `app.py` - Main Flask application
- `db.py` - Database operations
- `requirements.txt` - Python dependencies

## Future Enhancements

- User authentication system
- More lessons and question types
- Persistent user progress
- Mobile app versions
- Spaced repetition learning
- Leaderboards and social features

## License

This project is for demonstration purposes only. All medical content should be reviewed by professionals before being used for actual medical education. 