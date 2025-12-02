import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Admin() {
  const { token } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);

  async function carregar() {
    const res = await axios.get("http://localhost:3000/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPedidos(res.data);
  }

  async function alterarStatus(id, status) {
    await axios.post(
      `http://localhost:3000/admin/orders/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin - Pedidos</h2>

      {pedidos.map((p) => (
        <div key={p.id} className="bg-white p-4 rounded shadow mb-3">
          <p><b>ID:</b> {p.id}</p>
          <p><b>Cliente:</b> {p.customerName}</p>
          <p><b>Status:</b> {p.status}</p>

          <div className="flex gap-2 mt-2">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => alterarStatus(p.id, "em_preparo")}
            >
              Em preparo
            </button>
            <button
              className="bg-yellow-500 text-white px-2 py-1 rounded"
              onClick={() => alterarStatus(p.id, "pronto")}
            >
              Pronto
            </button>
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={() => alterarStatus(p.id, "entregue")}
            >
              Entregue
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
