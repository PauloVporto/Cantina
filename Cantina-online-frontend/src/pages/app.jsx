import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Login from "./Login";
import Register from "./Register";
import Catalogo from "./Catalogo";
import MeusPedidos from "./MeusPedidos";
import Admin from "./Admin";
import Navbar from "../components/Navbar";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

