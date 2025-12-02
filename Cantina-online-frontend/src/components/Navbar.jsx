import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Cantina Online</h2>

      <div style={styles.links}>
        <Link to="/catalogo" style={styles.link}>Catálogo</Link>
        <Link to="/meus-pedidos" style={styles.link}>Meus Pedidos</Link>
        <Link to="/login" style={styles.link}>Login</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "#e63946",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    marginBottom: "20px"
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold"
  },
  links: {
    display: "flex",
    gap: "20px"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  }
};
