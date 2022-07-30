import React, { useEffect, useState } from "react";
import { db, auth, storage, notification } from "../firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  getMessaging,
  getToken,
  onMessage
} from 'firebase/messaging'; 
import User from "../components/User";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [images, setImg] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [urls, setUrls] = useState([]);
 const [progress, setProgress] = useState(0);


  const user1 = auth.currentUser.uid;
  const user2 = chat.uid;
  const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
  
// Saves the messaging device token to Cloud Firestore.
async function saveMessagingDeviceToken() {
  try {
    //const currentToken = await getToken(getMessaging());
    const currentToken = await getToken(notification);

    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to Cloud Firestore.
      const tokenRef = doc(getFirestore(), 'fcmTokens', currentToken);
      //await setDoc(tokenRef, { uid: getAuth().currentUser.uid });
      await setDoc(tokenRef, { uid: user1 });


      // This will fire when a message is received while the app is in the foreground.
      // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
      onMessage(getMessaging(), (message) => {
        console.log(
          'New foreground notification from Firebase Messaging!',
          message.notification
        );
      });
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  } catch(error) {
    console.error('Unable to get messaging token.', error);
  };
}

// Requests permissions to show notifications.
async function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    // Notification permission granted.
    await saveMessagingDeviceToken();
  } else {
    console.log('Unable to get permission to notify.');
  }
}


  useEffect(() => {
    const usersRef = collection(db, "users");

    // create query object
    //const qr = query(usersRef, where("role", "==", "Agent"));
     const qr = query(usersRef, where("uid", "not-in", [user1]));
    // execute query

     const unsub = onSnapshot(qr, (querySnapshot) => {
       let users = [];
       querySnapshot.forEach((doc) => {
         users.push(doc.data());
       });
       setUsers(users);
     });
     return () => unsub();
  }, []);

 // console.log(users.role);
  const selectUser = async (user) => {

    setChat(user);

    const user2 = user.uid;
    console.log(user.role);

    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      console.log("msgs1:", msgs);
     // console.log("msgs2:", msgs.setChat(0).setText("Hello, welcome to modux"));
    // console.log("1:", msgs.data(0).setText("HEllo dear"));

      querySnapshot.forEach((doc) => {
        msgs.push(
          doc.data()
          
          );
      });
        //  console.log("1:", msgs.data().setText("HEllo dear"));

      //console.log("2:", doc.data(0).setText("HEllo dear"));
      setMsgs(msgs);
    });

    console.log("msgs:", msgs);


    // get last message b/w logged in user and selected user
    const docSnap = await getDoc(doc(db, "lastMsg", id));
    // if last message exists and message is from selected user
    if (docSnap.data() && docSnap.data().from !== user1) {
      // update last message doc, set unread to false
      await updateDoc(doc(db, "lastMsg", id), { unread: false });
    }
  };

  const handleOnChange = 
  //async (e) => {
    
  (e) => {
    //setImg([]);
    //console.log(":na me", images);

    for (var i = 0; i < e.target.files.length; i++) {
     var newImage = e.target.files[i];
     console.log(":", newImage);
     // setImg((prevState) => [...prevState, newImage]);
      images.push(newImage);

    }

    //console.log(":na me oo", images);


  };

  //Handle waiting to upload each file using promise
const uploadImageAsPromise = async(img) => {
  console.log(":img", img);

  return new Promise(function (resolve, reject) {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${new Date().getTime()} - ${img.name}`);
    
    const uploadTask = uploadBytesResumable(storageRef, img);

// Register three observers:
// 1. 'state_changed' observer, called any time the state changes
// 2. Error observer, called on failure
// 3. Completion observer, called on successful completion
//images.map((img) => {
  console.log("got here", img);

  uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    //const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    const progress = 
    //Math.round(
      (snapshot.bytesTransferred / snapshot.totalBytes) * 100
   // );
    setProgress(progress);
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
    console.log(error);
                reject(error);
  }, 
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    //images.map((image) => {

    getDownloadURL(uploadTask.snapshot.ref)
    .then((urls) => {
      console.log('File available at', urls);
     // urls.push(downloadURL);
      //setUrls(urls);
      setUrls((prevState) => [...prevState, urls]);

      addDoc(collection(db, "messages", id, "chat"), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: urls || "",
      });
  
       setDoc(doc(db, "lastMsg", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: urls || "",
        unread: true,
      });
    });

    setImg([]);
    setProgress(0);
    setUrls("");

  }

);



  });
}

  const handleSubmit = async (e) => {
    e.preventDefault();
   

    if(text === "" && images === []){
      console.log("got here ");
      return;
    }

    if(text){

      await addDoc(collection(db, "messages", id, "chat"), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
      });
  
      await setDoc(doc(db, "lastMsg", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        unread: true,
      });

    }

    if (images) {
    images.map((image) => {
     console.log("image: ", image);
      console.log("images2: ", images);


      uploadImageAsPromise (image);

      
    });
    }

    console.log("urls: ", urls);


    console.log("images: ", images);

    setText("");
    setImg([]);
    
  };
  return (
    <div className="home_container">
      <div className="users_container">
        {users.map((user) => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
          />
        ))}
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3>{chat.name}</h3>
            </div>
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message 
                    key={i} 
                    msg={msg} 
                    user1={user1} />
                  ))
                : null}


            </div>
            <MessageForm
              
              progress={progress}
              handleSubmit={handleSubmit}
              handleOnChange={handleOnChange}
              text={text}
              setText={setText}
              setImg={setImg}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
};

export default Home;
