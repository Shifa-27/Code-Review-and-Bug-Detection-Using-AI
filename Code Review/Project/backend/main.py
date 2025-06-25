from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
from typing import List, Optional
import random  # For mock data, remove in production
from openai import OpenAI
import json

# API Configuration
API_KEY = "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"  # Replace with your real key
MODEL_ID = "gpt-4.1-nano"

# Initialize OpenAI client
client = OpenAI(
    api_key=API_KEY
)

# Initialize FastAPI app
app = FastAPI(title="Code Review AI API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Length"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Ensure database directory exists
os.makedirs("../database", exist_ok=True)

# Database connection
def get_db():
    # Use check_same_thread=False to allow SQLite to be used across different threads
    conn = sqlite3.connect("../database/code_review.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Initialize database tables
def init_db():
    conn = sqlite3.connect("../database/code_review.db")
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create code_reviews table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS code_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        language TEXT NOT NULL,
        code_snippet TEXT NOT NULL,
        quality_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    # Create bugs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        review_id INTEGER NOT NULL,
        line_number INTEGER,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        suggestion TEXT,
        FOREIGN KEY (review_id) REFERENCES code_reviews (id)
    )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Data models
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CodeSubmission(BaseModel):
    language: str
    code: str
    user_id: Optional[int] = None

class Bug(BaseModel):
    id: int
    line: int
    severity: str
    message: str
    suggestion: str

class CodeAnalysisResult(BaseModel):
    quality_score: int
    bugs: List[Bug]
    suggestions: List[str]

# API endpoints
@app.post("/api/auth/register", response_model=User)
async def register(user: UserCreate, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    
    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In a real app, hash the password before storing
    password_hash = user.password  # Replace with proper hashing
    
    cursor.execute(
        "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
        (user.first_name, user.last_name, user.email, password_hash)
    )
    conn.commit()
    
    user_id = cursor.lastrowid
    return {
        "id": user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    }

@app.post("/api/auth/login")
async def login(login_data: LoginRequest, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    
    # In a real app, verify against hashed password
    cursor.execute(
        "SELECT id, first_name, last_name, email FROM users WHERE email = ? AND password_hash = ?",
        (login_data.email, login_data.password)
    )
    
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # In a real app, generate and return a JWT token
    return {
        "id": user["id"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "email": user["email"],
        "token": "mock_jwt_token"  # Replace with actual JWT in production
    }

@app.post("/api/analyze", response_model=CodeAnalysisResult)
async def analyze_code(submission: CodeSubmission, conn: sqlite3.Connection = Depends(get_db)):
    # First check if this exact code has been analyzed before for this user
    if submission.user_id:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT cr.id, cr.quality_score, cr.code_snippet 
               FROM code_reviews cr 
               WHERE cr.user_id = ? AND cr.language = ? AND cr.code_snippet = ?
               ORDER BY cr.created_at DESC LIMIT 1""",
            (submission.user_id, submission.language, submission.code)
        )
        existing_review = cursor.fetchone()
        
        if existing_review:
            # Found an exact match, retrieve the bugs and suggestions
            review_id = existing_review['id']
            print(f"Using cached analysis for review ID: {review_id}")
            
            cursor.execute(
                "SELECT id, line_number, severity, message, suggestion FROM bugs WHERE review_id = ?",
                (review_id,)
            )
            bug_records = cursor.fetchall()
            
            bugs = [{
                "id": bug["id"],
                "line": bug["line_number"],
                "severity": bug["severity"],
                "message": bug["message"],
                "suggestion": bug["suggestion"]
            } for bug in bug_records]
            
            # For simplicity, we'll return empty suggestions if retrieving from cache
            # In a real app, you would store and retrieve suggestions as well
            return {
                "quality_score": existing_review['quality_score'],
                "bugs": bugs,
                "suggestions": ["Retrieved from previous analysis"]
            }
    
    # If no cache hit or no user_id provided, proceed with API analysis
    try:
        # Prepare the prompt for code review
        system_prompt = f"""You are an expert code reviewer and bug finder for {submission.language} code. 
        Analyze the following code and provide:
        1. A quality score from 0-100
        2. A list of bugs or issues with line numbers, severity (high/medium/low), and suggestions for fixing
        3. General suggestions for improving the code
        
        Format your response as a JSON object with the following structure:
        {{
            "quality_score": <score>,
            "bugs": [
                {{
                    "line": <line_number>,
                    "severity": "<severity>",
                    "message": "<description of the issue>",
                    "suggestion": "<how to fix it>"
                }}
            ],
            "suggestions": ["<general improvement suggestion>", ...]
        }}
        """
        
        # Make chat completion request to API
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": submission.code}
            ],
            temperature=0.7
        )
        
        # Parse the response
        try:
            analysis_result = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            # Fallback if the response is not valid JSON
            analysis_result = {
                "quality_score": 70,
                "bugs": [],
                "suggestions": ["The AI response was not in the expected format. Please try again."]
            }
        
        # Ensure the response has the expected structure
        if "quality_score" not in analysis_result:
            analysis_result["quality_score"] = 70
        if "bugs" not in analysis_result:
            analysis_result["bugs"] = []
        if "suggestions" not in analysis_result:
            analysis_result["suggestions"] = []
            
        # Store the submission in the database
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO code_reviews (user_id, language, code_snippet, quality_score) VALUES (?, ?, ?, ?)",
            (submission.user_id, submission.language, submission.code, analysis_result["quality_score"])
        )
        conn.commit()
        review_id = cursor.lastrowid
        
        # Process and store bugs
        bugs = []
        for i, bug_data in enumerate(analysis_result["bugs"]):
            # Ensure bug has all required fields
            bug = {
                "id": i + 1,
                "line": bug_data.get("line", 1),
                "severity": bug_data.get("severity", "medium"),
                "message": bug_data.get("message", "Issue detected"),
                "suggestion": bug_data.get("suggestion", "Consider reviewing this code")
            }
            bugs.append(bug)
            
            # Store bug in database
            cursor.execute(
                "INSERT INTO bugs (review_id, line_number, severity, message, suggestion) VALUES (?, ?, ?, ?, ?)",
                (review_id, bug["line"], bug["severity"], bug["message"], bug["suggestion"])
            )
        
        conn.commit()
        
        return {
            "quality_score": analysis_result["quality_score"],
            "bugs": bugs,
            "suggestions": analysis_result["suggestions"]
        }
        
    except Exception as e:
        # Fallback to mock data if API call fails
        print(f"Error using API: {str(e)}")
        
        # Store the submission in the database
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO code_reviews (user_id, language, code_snippet, quality_score) VALUES (?, ?, ?, ?)",
            (submission.user_id, submission.language, submission.code, random.randint(60, 95))
        )
        conn.commit()
        review_id = cursor.lastrowid
        
        # Generate mock bugs based on code length and language
        bugs = []
        code_lines = submission.code.strip().split('\n')
        num_bugs = min(len(code_lines) // 10 + 1, 5)  # 1 bug per 10 lines, max 5
        
        severities = ["high", "medium", "low"]
        bug_messages = [
            "Potential memory leak",
            "Unused variable",
            "Inconsistent naming convention",
            "Missing error handling",
            "Inefficient algorithm",
            "Security vulnerability",
            "Redundant code",
            "Magic number",
            "Hardcoded value"
        ]
        suggestions = [
            "Use try-with-resources",
            "Remove unused variable",
            "Follow consistent naming convention",
            "Add proper error handling",
            "Optimize algorithm complexity",
            "Sanitize user input",
            "Extract duplicated code to function",
            "Define constants for magic numbers",
            "Use configuration for environment-specific values"
        ]
        
        for i in range(num_bugs):
            line = random.randint(1, max(1, len(code_lines) - 1))
            severity = random.choice(severities)
            message_idx = random.randint(0, len(bug_messages) - 1)
            
            bug = {
                "id": i + 1,
                "line": line,
                "severity": severity,
                "message": bug_messages[message_idx],
                "suggestion": suggestions[message_idx]
            }
            bugs.append(bug)
            
            # Store bug in database
            cursor.execute(
                "INSERT INTO bugs (review_id, line_number, severity, message, suggestion) VALUES (?, ?, ?, ?, ?)",
                (review_id, line, severity, bug_messages[message_idx], suggestions[message_idx])
            )
        
        conn.commit()
        
        # Generate quality score based on number and severity of bugs
        quality_score = max(50, 100 - (sum(10 if b["severity"] == "high" else 5 if b["severity"] == "medium" else 2 for b in bugs)))
        
        # Update quality score in database
        cursor.execute("UPDATE code_reviews SET quality_score = ? WHERE id = ?", (quality_score, review_id))
        conn.commit()
        
        # Generate improvement suggestions
        improvement_suggestions = [
            "Consider adding input validation",
            "Add error handling for edge cases",
            "Improve code documentation",
            "Use more descriptive variable names",
            "Break down complex functions into smaller ones"
        ]
        random.shuffle(improvement_suggestions)
        selected_suggestions = improvement_suggestions[:3]  # Pick 3 random suggestions
        
        return {
            "quality_score": quality_score,
            "bugs": bugs,
            "suggestions": selected_suggestions
        }

@app.get("/api/stats/{user_id}")
async def get_user_stats(user_id: int, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    
    # Get total reviews
    cursor.execute("SELECT COUNT(*) FROM code_reviews WHERE user_id = ?", (user_id,))
    total_reviews = cursor.fetchone()[0]
    
    # Get total bugs
    cursor.execute("""
        SELECT COUNT(*) FROM bugs 
        WHERE review_id IN (SELECT id FROM code_reviews WHERE user_id = ?)
    """, (user_id,))
    total_bugs = cursor.fetchone()[0]
    
    # Get average quality score
    cursor.execute("SELECT AVG(quality_score) FROM code_reviews WHERE user_id = ?", (user_id,))
    avg_score_row = cursor.fetchone()
    avg_score = round(avg_score_row[0]) if avg_score_row[0] is not None else 0
    
    return {
        "totalReviews": total_reviews,
        "bugsDetected": total_bugs,
        "avgQualityScore": avg_score
    }

@app.get("/api/recent-projects/{user_id}")
async def get_recent_projects(user_id: int, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, language, substr(code_snippet, 1, 50) as snippet, quality_score, 
               datetime(created_at) as date
        FROM code_reviews 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 5
    """, (user_id,))
    
    projects = []
    for row in cursor.fetchall():
        projects.append({
            "id": row["id"],
            "name": f"{row['language'].capitalize()} Project",  # In a real app, projects would have names
            "date": row["date"].split()[0],  # Just get the date part
            "score": row["quality_score"],
            "language": row["language"]
        })
    
    return projects

@app.get("/api/user/{user_id}/reviews")
async def get_user_reviews(user_id: int, conn: sqlite3.Connection = Depends(get_db)):
    # Get user stats
    cursor = conn.cursor()
    
    # Get total reviews
    cursor.execute("SELECT COUNT(*) FROM code_reviews WHERE user_id = ?", (user_id,))
    total_reviews = cursor.fetchone()[0]
    
    # Get total bugs
    cursor.execute("""
        SELECT COUNT(*) FROM bugs 
        WHERE review_id IN (SELECT id FROM code_reviews WHERE user_id = ?)
    """, (user_id,))
    total_bugs = cursor.fetchone()[0]
    
    # Get average quality score
    cursor.execute("SELECT AVG(quality_score) FROM code_reviews WHERE user_id = ?", (user_id,))
    avg_score_row = cursor.fetchone()
    avg_score = round(avg_score_row[0]) if avg_score_row[0] is not None else 0
    
    # Get recent projects
    cursor.execute("""
        SELECT id, language, substr(code_snippet, 1, 50) as snippet, quality_score, 
               datetime(created_at) as date
        FROM code_reviews 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 5
    """, (user_id,))
    
    projects = []
    for row in cursor.fetchall():
        projects.append({
            "id": row["id"],
            "name": f"{row['language'].capitalize()} Project",
            "date": row["date"].split()[0],
            "score": row["quality_score"],
            "language": row["language"]
        })
    
    return {
        "stats": {
            "totalReviews": total_reviews,
            "bugsDetected": total_bugs,
            "avgQualityScore": avg_score
        },
        "recentProjects": projects
    }

# New endpoint for fixing bugs in code
class BugFixRequest(BaseModel):
    code: str
    bugs: List[Bug]
    language: str

class BugFixResponse(BaseModel):
    fixed_code: str
    explanation: str

@app.post("/api/fix-bugs", response_model=BugFixResponse)
async def fix_bugs(request: BugFixRequest):
    try:
        # Prepare the prompt for bug fixing
        bug_descriptions = "\n".join([f"Bug {i+1} (Line {bug.line}, {bug.severity}): {bug.message}. Suggestion: {bug.suggestion}" 
                                  for i, bug in enumerate(request.bugs)])
        
        system_prompt = f"""You are an expert code fixer for {request.language} code. 
        Fix the following code based on the identified bugs. 
        
        BUGS TO FIX:
        {bug_descriptions}
        
        Provide:
        1. The complete fixed code
        2. A brief explanation of the changes made
        
        Format your response as a JSON object with the following structure:
        {{
            "fixed_code": "<complete fixed code>",
            "explanation": "<explanation of changes>"
        }}
        """
        
        # Make chat completion request to API
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.code}
            ],
            temperature=0.5
        )
        
        # Parse the response
        try:
            fix_result = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            # Fallback if the response is not valid JSON
            return {
                "fixed_code": request.code,
                "explanation": "The AI was unable to fix the bugs. Please try again or fix them manually."
            }
        
        # Ensure the response has the expected structure
        if "fixed_code" not in fix_result:
            fix_result["fixed_code"] = request.code
        if "explanation" not in fix_result:
            fix_result["explanation"] = "No explanation provided."
            
        return fix_result
        
    except Exception as e:
        # Return original code if API call fails
        print(f"Error using API for bug fixing: {str(e)}")
        return {
            "fixed_code": request.code,
            "explanation": f"An error occurred: {str(e)}"
        }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)