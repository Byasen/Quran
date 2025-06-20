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