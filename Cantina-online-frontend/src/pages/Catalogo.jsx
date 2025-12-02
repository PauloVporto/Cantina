import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Catalogo() {
  const { token } = useContext(AuthContext);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  async function carregarProdutos() {
    const res = await axios.get("http://localhost:3000/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProdutos(res.data);
  }

  function addCarrinho(produto) {
    setCarrinho([...carrinho, { productId: produto.id, quantity: 1 }]);
  }

  async function fazerPedido() {
    const res = await axios.post(
      "http://localhost:3000/orders",
      {
        paymentMethod: "pix",
        items: carrinho,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(`Pedido criado! ID: ${res.data.order.id}`);
    setCarrinho([]);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Catálogo</h2>

      <div className="grid grid-cols-2 gap-4">
        {produtos.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{p.name}</h3>
            <p>{p.description}</p>
            <p className="font-semibold">R$ {p.price.toFixed(2)}</p>
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
              onClick={() => addCarrinho(p)}
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>

      {carrinho.length > 0 && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mt-6"
          onClick={fazerPedido}
        >
          Finalizar Pedido
        </button>
      )}
    </div>
  );
}
