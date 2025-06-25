# 🧠 AI-Powered Code Review & Bug Detection System

This full-stack web application provides automated code review and bug detection using AI technologies. It enables users to submit code, receive intelligent analysis, detect bugs, and manage their projects through an intuitive dashboard.

## 🚀 Features

- ✍️ Code submission and analysis
- 🤖 AI-powered bug detection
- 🧪 Code quality assessment
- 🔐 User authentication and project tracking
- 📄 Detailed review reports

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Python (FastAPI)
- **Database:** SQLite3
- **AI Integration:** Machine Learning models using Transformers, PyTorch, scikit-learn, and OpenAI

## 🗂️ Project Structure

Project/
├── frontend/ # React.js frontend
│ └── src/
│ ├── components/ # Shared components (Navbar, Footer, etc.)
│ ├── pages/ # Screens (Login, Dashboard, Review, etc.)
│ └── context/ # Auth context and state
├── backend/ # FastAPI backend
│ └── main.py # API routes and ML integration
├── database/ # SQLite database file
└── README.md # Project documentation

## ⚙️ Getting Started

### ✅ Prerequisites

- Node.js & npm
- Python 3.8 or higher
- SQLite3


### 🧪 Installation

#### 1. Clone the Repository

``bash
git clone https://github.com/your_username/Code-Review-and-Bug-Detection-Using-AI.git
cd Code-Review-and-Bug-Detection-Using-AI.git

**Setup the frontend**
cd frontend
npm install
npm start

**Setup the backend**
cd backend
pip install -r requirements.txt
python main.py
