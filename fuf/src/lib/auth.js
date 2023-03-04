import React, { useState, useEffect, useContext, createContext } from "react";
import {
  signInWithPopup,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
} from "firebase/auth";
import { createUser } from "./db";
import app from "./firebase.config";

const auth = getAuth(app);
const authContext = createContext();

// <AuthProvider> { children } </AuthProvider>
// user should be available to all components
export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// useAuth hook can be used wherever necessary like this,
// const { user } = useAuth()
export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [user, setUser] = useState(null);
  if (user) {
    console.log(user.token);
  }

  const handleUser = async (rawUser) => {
    if (rawUser) {
      const user = await formatUser(rawUser);
      const { token, ...userWithoutToken } = user;
      createUser(user.uid, userWithoutToken);
      setUser(user);
      return user;
    } else {
      setUser(false);
      return false;
    }
  };

  const signin = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signinWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
    } catch (err) {
      console.log(err);
    }
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signout = async () => {
    await signOut(auth);
    setUser(false);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleUser(user);
      } else {
        setUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    signout,
    signinWithGithub,
  };
}

async function formatUser(user) {
  const idTokenResult = await user.getIdTokenResult();
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    token: idTokenResult.token,
    photoUrl: user.photoURL,
    provider: user.providerData[0].providerId,
  };
}