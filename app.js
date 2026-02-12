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
const departmentSelect = document.getElementById("student-dept");
const otherCourseField = document.getElementById("other-course-field");
const otherCourseInput = document.getElementById("other-course");
const totalVotesCount = document.getElementById("total-votes-count");

const LOCAL_VOTE_KEY = "student-appreciation-voted";

const showMessage = (text, type = "info") => {
  voteMessage.textContent = text;
  voteMessage.style.color = type === "error" ? "#b3261e" : "#1f1b2d";
};

const sanitizeInput = (value) => value.trim().replace(/\s+/g, " ");
const normalizeForMatch = (value) => sanitizeInput(value).toLowerCase();

const isLogicalFirstName = (value) => {
  if (!value) return false;
  const hasOnlyLetters = /^[A-Za-z]+$/.test(value);
  const hasValidLength = value.length >= 2 && value.length <= 20;
  return hasOnlyLetters && hasValidLength;
};

const isLogicalSurname = (value) => {
  if (!value) return false;
  const hasOnlyLetters = /^[A-Za-z]+$/.test(value);
  const hasValidLength = value.length >= 4 && value.length <= 20;
  return hasOnlyLetters && hasValidLength;
};

const toggleOtherCourseField = () => {
  const isOther = departmentSelect.value === "Other";
  otherCourseField.classList.toggle("hidden", !isOther);
  otherCourseInput.required = isOther;

  if (!isOther) {
    otherCourseInput.value = "";
  }
};

const updateTotalVotesCounter = (studentsSnapshot) => {
  let totalVotes = 0;

  studentsSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    totalVotes += Number(data.votes || 0);
  });

  totalVotesCount.textContent = String(totalVotes);
};

const getSelectedDepartment = () => {
  if (departmentSelect.value === "Other") {
    return sanitizeInput(otherCourseInput.value);
  }

  return sanitizeInput(departmentSelect.value);
};

const fetchLeaderboard = async () => {
  leaderboard.innerHTML = "";
  leaderboardEmpty.style.display = "none";

  try {
    const leaderboardQuery = query(collection(db, "students"), orderBy("points", "desc"), limit(10));
    const snapshot = await getDocs(leaderboardQuery);

    if (snapshot.empty) {
      leaderboardEmpty.style.display = "block";
    } else {
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
    }
  } catch (error) {
    leaderboardEmpty.style.display = "block";
    console.error("Failed to load leaderboard:", error);
  }

  try {
    const allVotesSnapshot = await getDocs(collection(db, "students"));
    updateTotalVotesCounter(allVotesSnapshot);
  } catch (error) {
    console.error("Failed to load total vote counter:", error);
  }
};

const submitVote = async (event) => {
  event.preventDefault();
  showMessage("");

  if (localStorage.getItem(LOCAL_VOTE_KEY)) {
    showMessage("You already voted. Thanks for participating!", "error");
    return;
  }

  const firstNameInput = document.getElementById("student-first-name");
  const surnameInput = document.getElementById("student-surname");
  const firstName = sanitizeInput(firstNameInput.value);
  const surname = sanitizeInput(surnameInput.value);
  const department = getSelectedDepartment();

  if (!firstName || !surname || !department) {
    showMessage("Please enter first name, surname, and department/course.", "error");
    return;
  }

  if (!isLogicalFirstName(firstName)) {
    showMessage("Please enter a valid first name (letters only, 2-20 characters).", "error");
    return;
  }

  if (!isLogicalSurname(surname)) {
    showMessage("Please enter a valid surname (letters only, at least 4 characters).", "error");
    return;
  }

  const fullName = `${firstName} ${surname}`;
  const nameKey = normalizeForMatch(fullName);
  const departmentKey = normalizeForMatch(department);

  try {
    const existingQuery = query(
      collection(db, "students"),
      where("nameKey", "==", nameKey),
      where("departmentKey", "==", departmentKey)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (existingSnapshot.empty) {
      await addDoc(collection(db, "students"), {
        firstName,
        surname,
        name: fullName,
        nameKey,
        department,
        departmentKey,
        points: 10,
        votes: 1,
        createdAt: serverTimestamp(),
      });
    } else {
      const docRef = doc(db, "students", existingSnapshot.docs[0].id);
      await updateDoc(docRef, {
        firstName,
        surname,
        name: fullName,
        nameKey,
        department,
        departmentKey,
        points: increment(10),
        votes: increment(1),
      });
    }

    localStorage.setItem(LOCAL_VOTE_KEY, "true");
    voteForm.reset();
    toggleOtherCourseField();
    showMessage("Vote submitted! Thank you for appreciating a classmate.");
    await fetchLeaderboard();
  } catch (error) {
    showMessage("Something went wrong while submitting your vote. Please try again.", "error");
    console.error(error);
  }
};

departmentSelect.addEventListener("change", toggleOtherCourseField);
voteForm.addEventListener("submit", submitVote);
refreshBtn.addEventListener("click", fetchLeaderboard);

toggleOtherCourseField();
fetchLeaderboard();
