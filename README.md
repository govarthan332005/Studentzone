# Writely - Writing Services Web App ✍️

A complete delivery-style web app for handwritten assignments, records, projects, and notes — built with Firebase backend.

## 🎨 Features

### User App
- **Beautiful Auth Pages** — Animated login/signup with username + email + password
- **Home Feed** — Zomato-style cards showing writing services with images, ratings, prices, delivery time
- **Categories** — Filter by Assignments, Records, Projects, Essays, Notes
- **Search** — Search across all writings
- **Product Detail** — Flipkart-style page with image gallery, full order form, pages counter, writing style/paper type options, file upload (PDF/DOC), or pickup option
- **Live Location** — GPS-based location picker + manual address entry
- **Orders** — Complete order tracking with timeline (Placed → Pickup Assigned → Picked Up → Writing → Completed → Out for Delivery → Delivered)
- **Order ID** — Unique ID for every order (WRT followed by timestamp)
- **Favorites** — Save your favorite writings
- **Settings** — Profile editing, address management, preferences, support, logout
- **Beautiful UI** — Soft pastel gradients (indigo→pink), smooth animations, mobile-first design
- **No-zoom** — Locked viewport for app-like experience

### Admin Panel
- **Dashboard** — Live stats: total orders, revenue, users, pending orders
- **Orders Management** — Search, filter by status, change order status (live updates push to user app)
- **Writings Management** — Add, edit, delete writing services
- **Users View** — All registered users with details
- **Analytics** — Status distribution charts, top selling writings, completion rates
- **Settings** — Configure delivery/platform fees, support contacts

## 🚀 Setup

### 1. Enable Firebase Services
In your Firebase Console (project: `slice-investment`):

**a) Authentication**
- Go to **Authentication → Sign-in method**
- Enable **Email/Password**

**b) Realtime Database**
- Go to **Realtime Database → Create Database**
- Choose location, start in **test mode** (or use rules below for production):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "writings": {
      ".read": true
    },
    "usernames": {
      ".read": true
    }
  }
}
```

**c) Storage** (optional, for file uploads)
- Go to **Storage → Get Started**
- Use default rules or:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Host the Files
You can use **any** static hosting:

- **Firebase Hosting** (recommended):
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  firebase deploy
  ```
- **Netlify / Vercel** — drag & drop the `writely-app` folder
- **GitHub Pages** — push to a repo, enable Pages
- **Local testing**: serve with any HTTP server (NOT `file://`):
  ```bash
  cd writely-app
  python3 -m http.server 8000
  # Open http://localhost:8000
  ```

⚠️ **Important**: Open via `http://` or `https://` — NOT `file://`. Firebase auth requires a real domain.

### 3. Create an Admin Account
1. Open the app → Sign up with email starting with `admin@` (e.g., `admin@writely.in`)
2. Go to `/admin/index.html` → Login with the same credentials
3. The admin role will be auto-granted on first login

Or manually set admin role in Firebase Realtime Database:
```
users/{uid}/role = "admin"
```

## 📁 Project Structure

```
writely-app/
├── index.html              # Login/Signup page
├── css/
│   ├── auth.css            # Login/Signup styles
│   └── app.css             # Main app styles
├── js/
│   ├── firebase-config.js  # Firebase initialization
│   ├── auth.js             # Login/Signup logic
│   ├── home.js             # Home page
│   ├── product.js          # Product/Order page
│   ├── orders.js           # Orders list
│   ├── order-detail.js     # Order tracking
│   └── settings.js         # Settings page
├── pages/
│   ├── home.html           # Home (Zomato style)
│   ├── product.html        # Product detail (Flipkart style)
│   ├── orders.html         # All orders
│   ├── order-detail.html   # Single order
│   ├── favorites.html      # Favorites
│   └── settings.html       # Settings
└── admin/
    ├── index.html          # Admin dashboard
    └── admin.js            # Admin logic
```

## 🎯 User Flow
1. **Signup** → Enter username, email, password
2. **Home** → Browse writings, filter by category, search
3. **Tap card** → Open product page (Flipkart style)
4. **Configure order** → Pages, style, paper type, upload file or choose pickup
5. **Set location** → GPS or manual address
6. **Pay & Order** → COD/UPI/Card → Get unique Order ID
7. **Track** → Watch order status update in real-time in Orders tab

## 🎨 Color Palette (Student-Friendly)
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#ec4899` (Pink)
- **Gradient**: Indigo → Pink (modern, attractive, used in CTAs and accents)
- **Background**: Soft pastel mix (lavender, cream, peach)

## 📱 Mobile-First
- Designed primarily for mobile (Zomato/Flipkart style)
- Responsive on desktop (max-width 480px centered)
- Disabled zoom for app-like feel
- iOS safe-area support
- Touch-optimized buttons & cards

## 🛠 Customization
- **Add writings**: Use the admin panel → Writings → Add New
- **Change colors**: Edit CSS `:root` variables in `auth.css` and `app.css`
- **Change fees**: Admin → Settings

Built with ❤️ for students!
