import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="auth-page">
        <div className="auth-card">

            <div className="auth-header">
                <h1>Smart Market Watchlist</h1>
                <p>Market monitoring and attention prioritization</p>
            </div>

            <div className="auth-content">
                <h2>Create Account</h2>

                {error && (
                    <p className="auth-error">
                        {error}
                    </p>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        minLength={6}
                        required
                    />

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/">
                        Login
                    </Link>
                </p>
            </div>

        </div>
    </div>
);
}

export default Register;