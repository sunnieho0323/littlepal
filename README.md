# 🐾 LittlePal

LittlePal is a collaborative web application built for SIT725.  
It is a **cute virtual cat room** 🐱 where users can:
- Manage personal memos
- Play interactive mini-games with their cat
- Chat with an AI-powered cat companion

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/sunnieho0323/littlepal.git
cd littlepal
```

## 2. Install dependencies
```bash
npm install 
```

### 3. Setup environment
Copy the .env.example file and configure your own .env:
```bash
cp .env.example .env
```
Example:
```bash
PORT=3000
MONGO_URL=mongodb://localhost:27017
MONGO_DB=littlepal
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
OPENAI_API_KEY=your-openai-api-key
```
### 4. Run the project
```bash
npm run dev
```

App will be running at:
👉 http://localhost:3000

---
🛠️ Tech Stack

Backend: Node.js + Express

Database: MongoDB (with Mongoose ODM)

Frontend: HTML, CSS, JavaScript, Materialize CSS

Realtime: Socket.IO

Testing: Jest + Playwright / Cypress

Version Control: Git + GitHub

Project Management: Trello (branches mapped 1:1 with cards)

---
📂 Project Structure

```text
littlepal/
├─ server.js                # Main server
├─ config/
│  └─ db.js                 # MongoDB connection
├─ app/
│  ├─ models/               # Mongoose models
│  ├─ controllers/          # Controller logic
│  ├─ services/             # Business logic
│  ├─ routes/               # API routes
│  └─ utils/                # Utility toolbox
├─ public/
│  ├─ index.html            # Cat room homepage
│  ├─ memo.html             # Memo feature (Jessica)
│  ├─ pet.html              # Pet mini-game (Vindya)
│  ├─ chat.html             # AI chat (Sunnie)
│  └─ js/                   # Frontend logic
│     ├─ common/            # Shared utilities
│     ├─ memo/              # Jessica’s scripts
│     ├─ pet/               # Vindya’s scripts
│     └─ chat/              # Sunnie’s scripts
├─ tests/                   # Unit & E2E tests
└─ docs/                    # Documentation (SRS, Test report, etc.)
```
---
🛠️ Tech Stack

Backend: Node.js + Express + MongoDB (Mongoose)

Frontend: HTML, CSS, JavaScript, Materialize CSS

Realtime: Socket.IO

Testing: Jest + Playwright/Cypress

Version Control: Git + GitHub

Project Management: Trello (branches mapped 1:1 with cards)

---
👥 Team Guidelines

Branching Strategy

Main branch (main) must always be stable and runnable.

Each feature/task = one branch.

Example: feat/memo-crud, feat/pet-game, feat/chat-ai, test/e2e

Branch names must match Trello cards.

Commits

Use clear commit messages:

feat(memo): add create & list functions

fix(pet): correct hunger calculation

test(chat): add E2E test for conversation flow

Code Style

Backend:

Models → PascalCase (e.g., User.js)

Controllers/Services → PascalCase + suffix (e.g., MemoController.js)

Routes → kebab-case (e.g., memos.routes.js)

Frontend:

Separate by feature (public/js/memo/*)

Use data-testid attributes for E2E testing.

Use Prettier + ESLint (npm run format before pushing).

Environment Variables

Never commit .env to Git.

Only commit .env.example.

Pull Requests

Small, frequent PRs.

At least one review before merging to main.

Always attach screenshots or test results.

---
🙋 Member Contribution Guidelines
Owen (Auth - Pass level)

Implement basic login/register.

Minimal UI for login page.

Save token + user in localStorage.

Redirect to / (index page) after login.

Jessica (Memos - HD target)

Full CRUD for memos.

Implement per-user notification (email or socket).

Frontend: memo.html + memo.api.js + memo.page.js.

Write unit tests for MemoService.

Provide a polished UI with Materialize.

Vindya (Pet Game - HD target)

Pet feeding & playing functions.

Mood/hunger state management.

Frontend: pet.html + pet.api.js + pet.page.js.

Provide E2E tests (feeding & playing workflow).

Socket events to update user’s pet state in real time.

Sunnie (Chat + Testing - HD target, Team Lead)

AI chat integration with OpenAI API.

Secure server-side call (never expose key).

Frontend: chat.html + chat.api.js + chat.page.js.

Lead E2E testing across the project.

Maintain README, .env.example, and team guidelines.

---
📑 Documentation

SRS.md → Functional & non-functional requirements

TEST_REPORT.md → E2E coverage with screenshots/videos

ARCHITECTURE.md → System design & MVC structure