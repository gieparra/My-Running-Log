My Running Log

Track your daily runs with distance, time, pace, mood, and weight — all stored locally in your browser.
Built with React (Vite) and designed for a smooth, keyboard-friendly experience.
🔗 Live Demo
👉 [https://your-running-log.netlify.app](https://myrunninglog.netlify.app/)
________________________________________
Features
* Multi-Step Form – Add date, distance, time, mood, and weight
* Auto-Save Drafts – Never lose progress (localStorage)
* Keyboard Navigation – Press Enter to move between steps
* Smart Time Input – Auto-formats hh:mm:ss as you type
* Pace Preview – Calculates pace per mile in real time
* Run History Table – Sort by newest, oldest, best pace, or longest run
* Edit & Delete Runs – Update any entry instantly
* CSV Export – Download your full run history
* Responsive Design – Works great on desktop or mobile
* Lightweight & Offline – No login or external database needed
________________________________________
Tech Stack
•	React (Vite)
•	JavaScript (ES6+)
•	HTML5 + CSS3
•	LocalStorage API
•	Custom Hooks & Utility Functions
________________________________________
Folder Structure
src/
│
├── components/
│   ├── MultiStepForm.jsx
│   ├── RunList.jsx
│
├── hooks/
│   └── useLocalRuns.js
│
├── utils/
│   └── time.js
│
├── App.jsx
└── main.jsx
