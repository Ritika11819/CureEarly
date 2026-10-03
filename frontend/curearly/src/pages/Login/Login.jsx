import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png"
import { api, API_URL } from "../../api";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const user = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
            if (user) {
                login(user);
            }
            navigate("/patient-profile");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.assign(`${API_URL}/oauth2/authorization/google`);
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* Logo / Brand */}
                <div className="login-brand">
                    <img
                        src={logo}
                        alt="Curearly logo"
                        className="login-logo"
                    />

                    <h1>Curearly</h1>
                </div>

                {/* Heading */}
                <div className="login-heading">
                    <h2>Welcome Back</h2>

                    <p>
                        Sign in to access your health information
                        and insights.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <div className="password-label-row">

                            <label htmlFor="password">
                                Password
                            </label>

                            <button
                                type="button"
                                className="forgot-password"
                                onClick={() =>
                                    console.log("Forgot password clicked")
                                }
                            >
                                Forgot password?
                            </button>

                        </div>

                        <div className="password-input-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                </form>

                {/* Divider */}
                <div className="login-divider">
                    <span></span>
                    <p>OR</p>
                    <span></span>
                </div>

                {/* Google Login */}
                <button
                    type="button"
                    className="google-button"
                    onClick={handleGoogleLogin}
                >
                    <span className="google-icon">G</span>

                    <span>
                        Continue with Google
                    </span>
                </button>

                {/* Register */}
                <div className="register-link">
                    <p>
                        Don't have an account?
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create one
                        </button>
                    </p>
                </div>

                {/* Security / Medical Disclaimer */}
                <div className="login-footer">
                    <p>
                        Your health information is protected
                        and handled securely.
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Login;
