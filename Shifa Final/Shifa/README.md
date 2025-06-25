# AI-Powered Code Review & Bug Detection System

This web application provides automated code review and bug detection using AI technologies.

## Features

- Code submission and analysis
- AI-powered bug detection
- Code quality assessment
- User authentication and project management
- Detailed analysis reports

## Tech Stack

- **Frontend**: React.js
- **Backend**: Python (FastAPI)
- **Database**: SQLite3
- **AI Integration**: Machine learning models for code analysis

## Project Structure

```
├── frontend/           # React.js frontend application
├── backend/            # Python FastAPI backend
│   ├── api/            # API endpoints
│   ├── models/         # Database models
│   ├── services/       # Business logic and AI services
│   └── utils/          # Utility functions
├── database/           # SQLite database files
└── docs/               # Documentation
```

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- SQLite3

### Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
3. Set up the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

## License

MIT