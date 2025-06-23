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
  const topicInput = document.getElementById("topicSelect");
  const defaultProjectCode = topicInput ? topicInput.value.trim() : "";

  const projectCode = prompt("حفظ الموضوع بقاعدة البيانات تحت مسمى", defaultProjectCode);
  if (!projectCode) return;

  const passcode = prompt("كلمة مرور (أدخل كلمة مرور جديدة إذا كان الموضوع جديدًا):");
  if (passcode === null) return;

  if (topicInput) topicInput.value = projectCode;

  const projectRef = firebase.database().ref(`projects/${projectCode}`);

  try {
    const snap = await projectRef.once("value");

    if (snap.exists()) {
      if (snap.val().passcode !== passcode) {
        alert("⛔ هناك موضوع بنفس الاسم وكلمة المرور خاطئة - لم ينجح الحفظ");
        return;
      }
    }

    const stateObj = JSON.parse(saveState());
    await projectRef.set({ passcode, state: stateObj });

    alert("✅ تم حفظ الموضوع بنجاح");
  } catch (err) {
    console.error(err);
    alert("لم ينجح الحفظ");
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
      alert("❗ لا يوجد موضوع بهذا الاسم في قاعدة البيانات.");
      selectRandomVerse();
      selectRandomWordAndSearch();
      return;
    }

    const data = snap.val();
    if (data.passcode !== passcode) {
      alert("⛔ كلمة المرور خاطئة - لم ينجح الاسترجاع");
      return;
    }

    if (data.state) {
      loadState(JSON.stringify(data.state));      // expects a JSON string
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