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

  // Save back to input field
  if (topicInput) topicInput.value = projectCode;

  const passcode = prompt("كلمة مرور (يمكن تركها فارغة للسماح للآخرين بالتعديل):");
  if (passcode === null) return;

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
    alert("❌ لم ينجح الحفظ");
  }
}



async function loadStateFromFirebase() {
  try {
    const topicInput = document.getElementById("topicSelect");

    const allProjectsSnap = await firebase.database().ref("projects").once("value");
    const allProjects = allProjectsSnap.val() || {};
    const projectNames = Object.keys(allProjects);

    let message = "أدخل مسمى المجموعة الذي تريد استرجاعها";
    if (projectNames.length > 0) {
      message += `\n\n📂 المجموعات المتاحة:\n- ${projectNames.join("\n- ")}`;
    }

    const defaultProjectCode = topicInput ? topicInput.value.trim() : "";
    const projectCode = prompt(message, defaultProjectCode);
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

    if (data.state) {
      loadState(JSON.stringify(data.state));

      // ✅ Set it AFTER loading to prevent clearing
      if (topicInput) topicInput.value = projectCode;
      topicName = projectCode;

    } else {
      alert("❌ لم ينجح الاسترجاع");
      selectRandomVerse();
      selectRandomWordAndSearch();
    }

  } catch (err) {
    console.error(err);
    alert("❌ لم ينجح الاسترجاع");
  }
}


