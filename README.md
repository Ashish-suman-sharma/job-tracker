# Job Tracker

A minimal, AI-powered job application tracking app with Telegram integration.

## Features

- 📱 **Telegram-first workflow** - Add jobs by sending any text to the bot
- 🤖 **AI-powered parsing** - Google Gemini extracts job details automatically
- 📊 **Clean dashboard** - Track your application stats at a glance
- 💼 **Interview view** - Focus on jobs that matter
- ⏰ **Auto-ghosted detection** - Jobs marked as "Ghosted" after 21 days
- 📅 **Follow-up reminders** - Get notified via Telegram

## Tech Stack

- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **AI:** Google Gemini API
- **Bot:** Telegram Bot API

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Google Gemini API Key

### 1. Clone & Setup

```bash
cd job-tracker

# Setup backend
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install

# Setup frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-super-secret-jwt-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Development

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

Open http://localhost:3000

### 4. Using Docker

```bash
docker-compose up -d
```

## Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message & instructions |
| `/link <email>` | Link your web account |
| `/list` | Show recent 10 jobs |
| `/select <n>` | Select a job to manage |
| `/stats` | View your application stats |

### Adding Jobs via Telegram

Just send any text! Examples:

```
Applied at Google for SDE Intern
```

```
Amazon - Software Engineer
link: https://amazon.jobs/xyz
```

The AI will extract the relevant details automatically.

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Jobs
- `GET /api/jobs` - List all jobs (with filters)
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get single job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/stats` - Dashboard stats
- `GET /api/jobs/interviews` - Interview/Shortlisted jobs

## Project Structure

```
job-tracker/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Gemini AI & Telegram
│   │   └── index.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API client
│   │   └── App.jsx         # Router setup
│   └── package.json
└── docker-compose.yml
```

## License

MIT