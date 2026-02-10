# Student Appreciation Board

Student Appreciation Board is a beginner-friendly web app where students can anonymously vote for their favorite classmate. Each vote adds **10 points** and the **leaderboard** updates from Firebase.

## Features
- Submit first name + surname + department/course
- Built-in course list: BTech, BE, BSc, BCA, BCom, MCA, MSc, MTech, MBA, and Other
- Anonymous voting (no login)
- First name validation (letters only, 2-20 characters)
- Surname validation (letters only, minimum 4 characters)
- Case-insensitive duplicate check by student name + department (e.g., Aman = aman in same department)
- One vote per user (browser-based)
- 10 points per vote
- Live leaderboard using Firebase Firestore
- Total votes cast shown in the main "Cast your vote" section
- No images, only text

---

## Step-by-step setup (beginner friendly)

### 1) Create a Firebase project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Click **Add project** → follow the steps → **Create project**.
3. When done, open the project dashboard.

### 2) Enable Firestore Database
1. In Firebase, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (for learning) → **Next**.
4. Select your region → **Enable**.

> ✅ Test mode is easier for learning, but you should lock it down later.

### 3) Get your Firebase config keys
1. In the Firebase console, click **Project Settings** (gear icon).
2. Scroll to **Your apps** → choose **Web app** (`</>` icon).
3. Register the app and copy the **firebaseConfig** object.

### 4) Add config keys to the project
Open `app.js` and replace the placeholders:

```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};
```

### 5) (Optional) Firestore rules for learning
If you are in test mode, you can skip this.  
When ready, you can use these simple rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{doc} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 6) Run the project locally
Because this app uses ES modules, it's best to run with a simple local server.

**Option A: VS Code Live Server**
1. Install **Live Server** extension.
2. Right click `index.html` → **Open with Live Server**.

**Option B: Python local server**
```bash
python -m http.server
```
Then open: `http://localhost:8000`

### 7) Use the app
1. Enter a student name and choose a department/course from the dropdown.
2. If you pick **Other**, type your course name.
3. Enter first name (letters only).
4. Enter surname (letters only, minimum 4 characters).
5. Click **Submit vote**.
6. The leaderboard updates immediately.

> One vote per user is enforced with `localStorage`.

---

## Project files
- `index.html` → layout
- `styles.css` → design
- `app.js` → Firebase + logic

---

## How it works (simple explanation)
1. User submits first name + surname and selects a course/department from the list (or uses Other).
2. The app checks `localStorage` to allow only one vote per browser.
3. It saves (or updates) the student in Firestore using case-insensitive matching for full name + department (example: Aman Sahu = aman sahu).
4. Each vote adds **10 points**.
5. Main section shows total votes cast so everyone can see participation.
6. Leaderboard shows top 10 students by points.

---

## Next steps (if you want to improve)
- Add Firebase Authentication for stronger one-vote enforcement
- Add admin-only reset
- Add department filters

Happy coding! 🎉
