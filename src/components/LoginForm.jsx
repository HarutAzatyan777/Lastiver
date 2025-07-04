import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import '../styles/LoginForm.css';

const ADMIN_EMAIL = "admin@pascali.com";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (userCred.user.email !== ADMIN_EMAIL) {
        setError("Թույլատրված չէ։ Միայն ադմին կարող է մուտք գործել։");
        return;
      }
      onLogin(userCred.user);
    } catch (err) {
      setError("Սխալ էլ․ հասցե կամ գաղտնաբառ");
    }
  };

  return (
    <form className="login-form" onSubmit={handleLogin}>
      <h2>Ադմին մուտք</h2>
      <input
        type="email"
        placeholder="Էլ․ հասցե"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Գաղտնաբառ"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Մուտք գործել</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
