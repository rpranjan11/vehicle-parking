
// Import the functions you need from the SDKs you need
import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
function StartFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBGE3ThtOkUr5uk6o1uIxkNU-M3ca6X41c",
        authDomain: "car-park-30ad7.firebaseapp.com",
        databaseURL: "https://car-park-30ad7-default-rtdb.firebaseio.com",
        projectId: "car-park-30ad7",
        storageBucket: "car-park-30ad7.appspot.com",
        messagingSenderId: "5296732129",
        appId: "1:5296732129:web:c9bd36d0184966cc1d84a0",
        measurementId: "G-C43584VJZ8"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    return getDatabase(app);
}

// export const database = getDatabase(app);
export default StartFirebase;
