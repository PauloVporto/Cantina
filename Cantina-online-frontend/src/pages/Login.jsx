import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin() {
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      login(res.data.token);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/catalogo");
      }
    } catch (err) {
      setMsg("Credenciais inválidas");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-8 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input className="border p-2 w-full mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input className="border p-2 w-full mb-2"
        placeholder="Senha"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Entrar
      </button>

      {msg && <p className="text-red-500 mt-2">{msg}</p>}
    </div>
  );
}
