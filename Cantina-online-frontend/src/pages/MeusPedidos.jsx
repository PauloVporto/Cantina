import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function MeusPedidos() {
  const { token } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);

  async function carregar() {
    const res = await axios.get("http://localhost:3000/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPedidos(res.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Meus Pedidos</h2>

      {pedidos.map((p) => (
        <div key={p.id} className="bg-white p-4 rounded shadow mb-2">
          <p><b>ID:</b> {p.id}</p>
          <p><b>Status:</b> {p.status}</p>
          <p><b>Total:</b> R$ {p.total.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
