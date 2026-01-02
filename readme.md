You are a senior full-stack engineer + product designer building a simple, minimal, no-clutter Job Application Tracking Web App for an individual user.
The user is a student/job seeker applying to many jobs daily and wants zero friction while logging applications.

1️⃣ Core Problem to Solve

Manual job tracking is time-consuming and annoying.
The app must allow fast, flexible, AI-assisted job logging, mainly via Telegram, and clean visualization on the web.

2️⃣ High-Level Product Goals

Minimal UI (Not fancy, not cluttered)

Fast job logging (≤ 10 seconds)

Telegram-first workflow

AI-powered parsing of messy text

Clear job status tracking

Timeline & interview-focused views

3️⃣ Tech Stack (Recommended but flexible)

Frontend: React + Tailwind (clean, simple UI)

Backend: Node.js + Express

Database: MongoDB (schema flexible)

AI: Google Gemini API (text → structured JSON)

Bot: Telegram Bot API

Auth: Simple email + password or magic link

Hosting: Any (Vercel / Render / Railway)

4️⃣ Core Entities (Data Model)

Each Job Application should include (AI fills what it can):

{
  "id": "uuid",
  "companyName": "",
  "role": "",
  "jobLink": "",
  "contactEmail": "",
  "platform": "LinkedIn / Company Site / Referral / Unknown",
  "appliedDate": "",
  "status": "Applied | Interview | Shortlisted | Rejected | Offer | Ghosted",
  "notes": "",
  "lastUpdated": "",
  "source": "Telegram | Web",
  "followUpDate": ""
}

5️⃣ Telegram Bot – MAIN FEATURE ⭐
5.1 Message Input (Very Flexible)

User can send anything, such as:

Only job link

Only company name

Only email

Random mixed text

Full paragraph copied from LinkedIn

Example:

Applied at Amazon SDE Intern
link: https://amazon.jobs/xyz
hr mail: hr@amazon.com

5.2 AI Processing Flow

Telegram bot receives message

Backend sends raw text to Gemini AI

Gemini:

Extracts relevant fields

Normalizes data

Returns strict JSON

Backend:

Validates JSON

Stores job in DB

Replies on Telegram with summary

5.3 Confirmation Message (Telegram)

Bot replies:

✅ Job added

Company: Amazon
Role: SDE Intern
Status: Applied
Date: Today

Reply with:
1️⃣ Update status
2️⃣ Add note
3️⃣ Set follow-up

6️⃣ Telegram Commands

Implement simple commands:

/add

Default mode (even without command)

Any text → AI → new job

/list

Shows last 10 jobs

Example:

1. Amazon – Applied
2. Google – Interview
3. Swiggy – Ghosted

/select 2

Select a job from list

After selecting a job:

Bot shows buttons:

🔄 Change status

📝 Add note

📅 Set follow-up

❌ Mark rejected

🎉 Mark offer

7️⃣ Web App Features (Clean & Focused)
7.1 Dashboard

Total applied

Interviews

Offers

Rejections

Ghosted

(Simple number cards, no charts overload)

7.2 Job List Page

Table / clean cards

Filters:

Status

Date

Company

Sort:

Latest applied

Interview first

7.3 Interview View (Important ⭐)

A special page:

Shows only Interview / Shortlisted jobs

Sorted by interview date

Helps daily prep

7.4 Timeline View

For each job:

Applied → Interview → Offer / Rejected


Simple vertical timeline

7.5 Job Detail Page

Editable fields

Notes

Follow-up reminder

History of status changes

8️⃣ Smart Features (You Decide & Implement)
✅ Auto Ghosted Detection

If no update after 21 days → mark as “Ghosted”

✅ Follow-up Reminder

Telegram reminder:

⏰ Follow up with Google today

✅ Duplicate Detection

If same job link/company → warn user

✅ Daily Summary (Optional)

Telegram message:

📊 Today Summary
Applied: 3
Interviews: 1

9️⃣ UI Design Rules (Very Important)

White / light background

One primary color

No gradients

No heavy animations

Mobile-friendly

Data-first UI

Think:

“Notion meets a spreadsheet, but simpler”

🔚 Final Instruction to AI

Build this app step-by-step:

Database schema

Telegram bot logic

Gemini AI prompt for text → JSON

Backend APIs

Minimal frontend UI

Deployment-ready code

Prioritize clarity, simplicity, and speed over fancy UI.