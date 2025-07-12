const firebaseConfig = {
  // apiKey: "YOUR_API_KEY", // This is unique to your specific web app
  authDomain: "qurannotebookdb.firebaseapp.com",
  databaseURL: "https://qurannotebookdb-default-rtdb.firebaseio.com", // Using your specific default database URL
  projectId: "qurannotebookdb",
  storageBucket: "qurannotebookdb.appspot.com", // Based on your project ID
  // messagingSenderId: "YOUR_SENDER_ID", // This is unique to your specific web app
  // appId: "YOUR_APP_ID" // This is unique to your specific web app
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


  // Save your JSON blob to a fixed path (e.g. "status/content")
  function saveContentStatus(json) {
    return firebase.database().ref("status/content").set(json);
  }

  // Load the JSON blob from the same path
  function loadContentStatus() {
    return firebase.database().ref("status/content").once("value")
      .then(snapshot => snapshot.val());
  }



async function saveStateToFirebase() {
  saveState();
  const topicInput = document.getElementById("topicSelect");
  const defaultProjectCode = topicInput ? topicInput.value.trim() : "";

  const projectCode = prompt("حفظ المجموعة في قاعدة البيانات تحت مسمى", defaultProjectCode);
  if (!projectCode) return;

  const passcode = prompt("كلمة مرور (يمكن تركها فارغة للسماح للآخرين بالتعديل):");
  if (passcode === null) return;

  if (topicInput) topicInput.value = projectCode;

  const projectRef = firebase.database().ref(`projects/${projectCode}`);

  try {
    const snap = await projectRef.once("value");

    if (snap.exists()) {
      if (snap.val().passcode !== passcode) {
        alert("⛔ هناك مجموعة بنفس الاسم وكلمة المرور خاطئة - لم ينجح الحفظ");
        return;
      }
    }

    const stateObj = JSON.parse(saveState());
    await projectRef.set({ passcode, state: stateObj });

    alert("✅ تم حفظ المجموعة بنجاح");
  } catch (err) {
    console.error(err);
    alert("لم ينجح الحفظ");
  }
}

/* ---------- LOAD ---------- */
async function loadStateFromFirebase() {
  try {
    // Fetch all projects from Firebase
    const allProjectsSnap = await firebase.database().ref("projects").once("value");
    const allProjects = allProjectsSnap.val() || {};

    // List all project names
    const projectNames = Object.keys(allProjects);
    let message = "أدخل مسمى المجموعة الذي تريد استرجاعها";
    if (projectNames.length > 0) {
      message += `\n\n📂 المجموعات المتاحة:\n- ${projectNames.join("\n- ")}`;
    }

    // Ask user for project name
    const projectCode = prompt(message);
    if (!projectCode) return;

    const projectRef = firebase.database().ref(`projects/${projectCode}`);
    const snap = await projectRef.once("value");

    if (!snap.exists()) {
      alert("❗ لا يوجد مجموعة بهذا الاسم في قاعدة البيانات.");
      selectRandomVerse();
      selectRandomWordAndSearch();
      return;
    }

    const data = snap.val();

    // Skip password check completely and load state directly
    if (data.state) {
      loadState(JSON.stringify(data.state));
    } else {
      alert("لم ينجح الإسترجاع");
      selectRandomVerse();
      selectRandomWordAndSearch();
    }

  } catch (err) {
    console.error(err);
    alert("لم ينجح الاسترجاع");
  }
}

