import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "./loginPage.css";

const LoginPage = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const adminKey = process.env.REACT_APP_ADMIN_SECRET;

    if (key === adminKey) {
      localStorage.setItem("adminToken", key);
      navigate("/dashboard");
    } else {
      setError("Invalid admin key. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <NavBar showAdminLink={false} />
      <main className="login-page__body">
        <section className="login-card">
          <header className="login-card__header">
            <h1 className="login-card__title">Admin Login</h1>
            <p className="login-card__subtitle">
              Enter the secret key shared with administrators to manage shipments.
            </p>
          </header>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-label">Secret key</span>
              <input
                className="login-input"
                type="password"
                placeholder="Enter admin secret key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
            </label>
            <button className="login-submit" type="submit">
              Continue
            </button>
          </form>
          {error && <div className="login-alert">{error}</div>}
        </section>
      </main>
    </div>
  );
};

export default LoginPage;