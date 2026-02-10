import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  doc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCD3M3O6Gve-fR-ufFY2SCKNuZakdHE6X8",
  authDomain: "star-student-55d73.firebaseapp.com",
  projectId: "star-student-55d73",
  storageBucket: "star-student-55d73.firebasestorage.app",
  messagingSenderId: "884212158549",
  appId: "1:884212158549:web:d402b23ad59ce5de2ec4dc",
  measurementId: "G-R7SDNPGJ4P"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const voteForm = document.getElementById("vote-form");
const voteMessage = document.getElementById("vote-message");
const leaderboard = document.getElementById("leaderboard");
const leaderboardEmpty = document.getElementById("leaderboard-empty");
const refreshBtn = document.getElementById("refresh-btn");

const LOCAL_VOTE_KEY = "student-appreciation-voted";

const showMessage = (text, type = "info") => {
  voteMessage.textContent = text;
  voteMessage.style.color = type === "error" ? "#b3261e" : "#1f1b2d";
};

const sanitizeInput = (value) => value.trim().replace(/\s+/g, " ");

const fetchLeaderboard = async () => {
  leaderboard.innerHTML = "";
  leaderboardEmpty.style.display = "none";

  const leaderboardQuery = query(collection(db, "students"), orderBy("points", "desc"), limit(10));
  const snapshot = await getDocs(leaderboardQuery);

  if (snapshot.empty) {
    leaderboardEmpty.style.display = "block";
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.className = "leaderboard-item";
    li.innerHTML = `
      <div>
        <span class="name">${data.name}</span>
        <span class="meta">${data.department}</span>
      </div>
      <span class="points">${data.points} pts</span>
    `;
    leaderboard.appendChild(li);
  });
};

const submitVote = async (event) => {
  event.preventDefault();
  showMessage("");

  if (localStorage.getItem(LOCAL_VOTE_KEY)) {
    showMessage("You already voted. Thanks for participating!", "error");
    return;
  }

  const nameInput = document.getElementById("student-name");
  const deptInput = document.getElementById("student-dept");
  const name = sanitizeInput(nameInput.value);
  const department = sanitizeInput(deptInput.value);

  if (!name || !department) {
    showMessage("Please enter both a student name and department.", "error");
    return;
  }

  try {
    const existingQuery = query(
      collection(db, "students"),
      where("name", "==", name),
      where("department", "==", department)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (existingSnapshot.empty) {
      await addDoc(collection(db, "students"), {
        name,
        department,
        points: 10,
        votes: 1,
        createdAt: serverTimestamp(),
      });
    } else {
      const docRef = doc(db, "students", existingSnapshot.docs[0].id);
      await updateDoc(docRef, {
        points: increment(10),
        votes: increment(1),
      });
    }

    localStorage.setItem(LOCAL_VOTE_KEY, "true");
    voteForm.reset();
    showMessage("Vote submitted! Thank you for appreciating a classmate.");
    await fetchLeaderboard();
  } catch (error) {
    showMessage("Something went wrong while submitting your vote. Please try again.", "error");
    console.error(error);
  }
};

voteForm.addEventListener("submit", submitVote);
refreshBtn.addEventListener("click", fetchLeaderboard);

fetchLeaderboard();
