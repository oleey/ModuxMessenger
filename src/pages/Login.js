import React, { useState } from "react";
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from "firebase/auth";
import { auth, db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const history = useHistory();

  const { email, password, error, loading } = data;

  const triggerResetEmail = async () => {
    await sendPasswordResetEmail(auth, "contact@moduxexchange.com");
    //await sendPasswordResetEmail(auth, "atandaminat@gmail.com");

    console.log("Password reset email sent");
    alert('Please check your email...')

  }

  const forgotPassword = () => {
    sendPasswordResetEmail(email)
        .then(function () {
            alert('Please check your email...')
        }).catch(function (e) {
            console.log(e)
        }) 
    }

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!email || !password) {
      setData({ ...data, error: "All fields are required" });
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      //.then(()=>{
        // send verification mail.
      //user.user.sendEmailVerification();
      //sendEmailVerification(auth.currentUser)
      //auth.signOut();
      //alert("Email sent");

     // sendPasswordResetEmail(auth, email)
 // .then(() => {
    // Password reset email sent!
    // ..
 // })
 // .catch((error) => {
  //  const errorCode = error.code;
   // const errorMessage = error.message;
    // ..
  //});
    //  history.replace("/");
   // })
   // .catch(alert);

      await updateDoc(doc(db, "users", result.user.uid), {
        isOnline: true,
      });
      setData({
        email: "",
        password: "",
        error: null,
        loading: false,
      });
      history.replace("/");
    } catch (err) {
      setData({ ...data, error: err.message, loading: false });
    }

   // sendEmailVerification(auth.currentUser)
 // .then(() => {
    // Email verification sent!
    // ...
  //});

    
  };

  
  return (
    <section>
      <h3>Log into your Account</h3>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input_container">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            value={email}
            onChange={handleChange}
          />
        </div>
        <div className="input_container">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="btn_container">
          <button className="btn" disabled={loading}>
            {loading ? "Logging in ..." : "Login"}
          </button>
        </div>
        
      </form>

    </section>
  );
};

// add to line 125     <div className="btn_container"> <button className="btn" onClick={triggerResetEmail}>Reset Password</button></div>

export default Login;
