# 🎓 StudentsZone

A premium, fully responsive website for students to discover **Internships**, **Scholarships**, and **Jobs** — with a complete admin panel powered by Firebase.

## ✨ Features

### 👨‍🎓 User Side (`index.html`)
- Beautiful animated hero with live stats counter
- Browse Internships, Scholarships, Jobs (real-time updates)
- Live search/filter on each section
- Detail modal with full information
- Smart "Apply Now" buttons:
  - **Apply Now** → opens admin-set application link in new tab
  - **Not Available** → disabled badge
  - **Walk-in Interview** → yellow walk-in indicator
- Smooth scroll, AOS animations, gradient orbs, premium fonts
- Fully responsive (mobile / tablet / desktop)

### 🛡️ Admin Panel (`admin.html`)
- Secure Firebase Authentication login
- One-click "Setup admin account" for first-time admins
- Dashboard with live counts of all listings
- Full CRUD (Create / Read / Update / Delete) for:
  - Internships
  - Scholarships
  - Jobs
- Apply link control per listing: **Available / Not Available / Walk-in**
- Custom labels for each type (Company vs Provider, Stipend vs Amount vs Salary)
- Toast notifications, confirm-before-delete modals
- Fully responsive sidebar dashboard

## 🚀 Setup (3 steps)

### 1️⃣ Enable Email/Password Authentication
1. Go to your [Firebase Console](https://console.firebase.google.com/project/slice-investment/authentication/providers)
2. Click **Authentication → Sign-in method**
3. Enable **Email/Password**

### 2️⃣ Set Realtime Database Rules
Go to [Realtime Database → Rules](https://console.firebase.google.com/project/slice-investment/database/slice-investment-default-rtdb/rules) and paste:

```json
{
  "rules": {
    "internships":  { ".read": true, ".write": "auth != null" },
    "scholarships": { ".read": true, ".write": "auth != null" },
    "jobs":         { ".read": true, ".write": "auth != null" }
  }
}
```
This allows **anyone to read** listings (so users see them), but only **authenticated admins to write**.

### 3️⃣ Run Locally
Because this uses ES modules, you need to serve over HTTP (not `file://`):

```bash
# Option A — Python
python3 -m http.server 8000

# Option B — Node
npx serve .
```

Open `http://localhost:8000`.

### 4️⃣ Create your Admin Account
1. Go to `http://localhost:8000/admin.html`
2. Click **"Setup admin account"**
3. Enter an email + password (min 6 chars) → click **Create Admin Account**
4. You're in! Add internships, scholarships, jobs.

> 💡 Anyone who knows the admin URL with credentials can log in. To prevent anyone from creating accounts after your initial setup, you can disable signups in Firebase Auth settings — login still works with existing accounts.

## 📂 File Structure

```
studentszone/
├── index.html          # User-facing site
├── styles.css          # Shared styles
├── app.js              # User-side logic
├── admin.html          # Admin dashboard
├── admin.css           # Admin-specific styles
├── admin.js            # Admin CRUD logic
├── firebase-config.js  # Your Firebase config
└── README.md
```

## 🎨 Design Highlights
- **Fonts**: Plus Jakarta Sans + Space Grotesk (premium pairing)
- **Icons**: Font Awesome 6
- **Animations**: AOS (Animate On Scroll), CSS gradient orbs, smooth scroll
- **Theme**: Dark glassmorphism with purple-indigo-pink gradients
- **Performance**: Lightweight, no heavy frameworks — pure HTML/CSS/JS

## 🛠️ Tech Stack
- HTML5 + CSS3 + Vanilla JS (ES Modules)
- Firebase Realtime Database
- Firebase Authentication
- AOS animations + Font Awesome icons

---

Built with ❤️ for students.
