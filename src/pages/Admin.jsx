import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import PasswordlessLogin from "../components/PasswordlessLogin";
import AdminPanelFirebase from "../components/AdminPanelFirebase";
import MenuPage from "../components/QrMenuPage"; 


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => setUser(usr));
  }, []);

  if (!user)
    return <PasswordlessLogin onLogin={(user) => setUser(user)} />;

  return (
    <div>
      <h1>Բարի գալուստ՝ {user.email}</h1>
      <button onClick={() => signOut(auth)}>Դուրս գալ</button>

      <AdminPanelFirebase />
      <hr />
      <MenuPage />
    
    </div>
  );
}
