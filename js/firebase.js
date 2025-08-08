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

  const projectCode = prompt("حفظ الباب في قاعدة البيانات تحت مسمى", defaultProjectCode);
  if (!projectCode) return;

  // Save back to input field
  if (topicInput) topicInput.value = projectCode;

  const projectRef = firebase.database().ref(`projects/${projectCode}`);

  try {
    const snap = await projectRef.once("value");

    let passcode;

    if (snap.exists()) {
      // ✅ Topic exists: ask for existing passcode
      passcode = prompt(`باب "${projectCode}" موجود في قاعدة البيانات.\nالرجاء إدخال كلمة المرور لتعديل بياناته:`);
      if (passcode === null) return;

      if (passcode !== snap.val().passcode) {
        alert("⛔ كلمة المرور غير صحيحة. لم يتم الحفظ.");
        return;
      }
    } else {
      // ✅ Topic doesn't exist: ask to set a passcode (not empty)
      while (true) {
        passcode = prompt(`الموضوع "${projectCode}" جديد.\nيرجى إدخال كلمة مرور (يجب تذكرها للتعديل مستقبلاً):`);
        if (passcode === null) return; // user canceled
        if (passcode.trim() !== '') break;
        alert("⚠️ لا يمكن ترك كلمة المرور فارغة.");
      }
    }

    const stateObj = JSON.parse(saveState());
    await projectRef.set({ passcode, state: stateObj });

    alert("✅ تم حفظ المجموعة بنجاح");
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ أثناء الحفظ.");
  }
}




async function loadStateFromFirebase() {
  try {
    const topicInput = document.getElementById("topicSelect");

    const allProjectsSnap = await firebase.database().ref("projects").once("value");
    const allProjects = allProjectsSnap.val() || {};
    const projectNames = Object.keys(allProjects);

    let message = "أدخل اسم الباب لتحميله من قاعدة البيانات";
    if (projectNames.length > 0) {
      message += `\n\n📂 الأبواب المتاحة:\n- ${projectNames.join("\n- ")}`;
    }

    const defaultProjectCode = topicInput ? topicInput.value.trim() : "";
    const projectCode = prompt(message, defaultProjectCode);
    if (!projectCode) return;

    const projectRef = firebase.database().ref(`projects/${projectCode}`);
    const snap = await projectRef.once("value");

    if (!snap.exists()) {
      alert("❗ لا يوجد باب بهذا الاسم في قاعدة البيانات.");
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
    }
    alert("✅ تم تحميل البيانات بنجاح");
  } catch (err) {
    console.error(err);
    alert("❌ لم ينجح تحميل البيانات");
  }

  

}


async function selectStartingTopic() {
    const topicNameToLoad = "دلائل النبوة";
    const topicInput = document.getElementById("topicSelect");

    const projectRef = firebase.database().ref(`projects/${topicNameToLoad}`);
    const snap = await projectRef.once("value");

    const data = snap.val();

    if (data.state) {
      loadState(JSON.stringify(data.state));

      // ✅ Set it AFTER loading to prevent clearing
      if (topicInput) topicInput.value = topicNameToLoad;
      topicName = topicNameToLoad;

    } 
}


