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



  /* ---------- SAVE ---------- */
async function saveStateToFirebase() {
  const projectCode = prompt("حفظ الموضوع تحت مسمى");
  if (!projectCode) return;                       // user cancelled

  const passcode = prompt("كلمة مرور (أدخل كلمة مرور جديدة اذا كان الموضوع جديدا):");
  if (passcode === null) return;

  const projectRef = firebase.database().ref(`projects/${projectCode}`);

  try {
    const snap = await projectRef.once("value");

    if (snap.exists()) {
      // project already in DB → verify passcode
      if (snap.val().passcode !== passcode) {
        alert("⛔ Wrong passcode – save aborted.");
        return;
      }
    }

    // either new project or correct passcode → overwrite state
    const stateObj = JSON.parse(saveState());    // your own exporter -> object
    await projectRef.set({ passcode, state: stateObj });

    alert("✅ State saved.");
  } catch (err) {
    console.error(err);
    alert("Save failed – see console.");
  }
}

/* ---------- LOAD ---------- */
async function loadStateFromFirebase() {
  const projectCode = prompt("أدخل مسمى الموضوع الذي تريد استرجاعه");
  if (!projectCode) return;

  const passcode = prompt("كلمة المرور");
  if (passcode === null) return;

  const projectRef = firebase.database().ref(`projects/${projectCode}`);

  try {
    const snap = await projectRef.once("value");

    if (!snap.exists()) {
      alert("Project not found — showing random verse.");
      selectRandomVerse();
      selectRandomWordAndSearch();
      return;
    }

    const data = snap.val();
    if (data.passcode !== passcode) {
      alert("⛔ Wrong passcode – cannot load.");
      return;
    }

    if (data.state) {
      loadState(JSON.stringify(data.state));      // expects a JSON string
    } else {
      alert("Project has no saved state — showing random verse.");
      selectRandomVerse();
      selectRandomWordAndSearch();
    }
  } catch (err) {
    console.error(err);
    alert("Load failed – see console.");
  }
}