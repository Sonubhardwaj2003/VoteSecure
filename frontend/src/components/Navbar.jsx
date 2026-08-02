import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ display: "flex", gap: 16, padding: 16, borderBottom: "1px solid #ddd" }}>
      <Link to="/">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/results">Results</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  );
}
