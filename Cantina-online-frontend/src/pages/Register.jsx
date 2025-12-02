import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleChange(e) {
    setForm({ ...form, [ e.target.name ]: e.target.value });
  }

  async function submit() {
    try {
      await axios.post("http://localhost:3000/auth/register", form);
      navigate("/");
    } catch (err) {
      alert("Erro ao registrar");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-8 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Criar Conta</h2>

      <input className="border p-2 w-full mb-2"
        name="name"
        placeholder="Nome"
        onChange={handleChange}
      />

      <input className="border p-2 w-full mb-2"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input className="border p-2 w-full mb-2"
        type="password"
        name="password"
        placeholder="Senha"
        onChange={handleChange}
      />

      <button onClick={submit}
        className="bg-green-600 text-white px-4 py-2 rounded w-full">
        Registrar
      </button>
    </div>
  );
}
