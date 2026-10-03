import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import logo from "../../assets/logo.png";
import { api, API_URL } from "../../api";
import { useAuth } from "../../context/AuthContext";

function Register() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (
            !fullName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all the fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const user = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ fullName, email, phone, password }) });
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

    const handleGoogleRegister = () => {

        window.location.assign(`${API_URL}/oauth2/authorization/google`);
    };

    return (
        <div className="register-page">

            <div className="register-card">

                {/* Logo */}
                <div className="register-brand">

                    <img
                        src={logo}
                        alt="Curearly logo"
                        className="register-logo"
                    />

                    <h1>Curearly</h1>

                </div>


                {/* Heading */}
                <div className="register-heading">

                    <h2>Create Your Account</h2>

                    <p>
                        Create your Curearly account and keep your
                        health information organized.
                    </p>

                </div>


                {/* Error */}
                {error && (
                    <div className="register-error">
                        {error}
                    </div>
                )}


                {/* Form */}
                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >

                    {/* Full Name */}
                    <div className="register-form-group">

                        <label htmlFor="fullName">
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                            autoComplete="name"
                            required
                        />

                    </div>


                    {/* Email */}
                    <div className="register-form-group">

                        <label htmlFor="registerEmail">
                            Email Address
                        </label>

                        <input
                            id="registerEmail"
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


                    {/* Phone */}
                    <div className="register-form-group">

                        <label htmlFor="phone">
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(event) =>
                                setPhone(event.target.value)
                            }
                            autoComplete="tel"
                            required
                        />

                    </div>


                    {/* Password */}
                    <div className="register-form-group">

                        <label htmlFor="registerPassword">
                            Password
                        </label>

                        <div className="register-password-wrapper">

                            <input
                                id="registerPassword"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                    </div>


                    {/* Confirm Password */}
                    <div className="register-form-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <div className="register-password-wrapper">

                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {
                                    showConfirmPassword
                                        ? "Hide"
                                        : "Show"
                                }
                            </button>

                        </div>

                    </div>


                    {/* Register */}
                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>


                {/* Divider */}
                <div className="register-divider">

                    <span></span>

                    <p>OR</p>

                    <span></span>

                </div>


                {/* Google */}
                <button
                    type="button"
                    className="register-google-button"
                    onClick={handleGoogleRegister}
                >

                    <span className="register-google-icon">
                        G
                    </span>

                    <span>
                        Continue with Google
                    </span>

                </button>


                {/* Login */}
                <div className="login-link">

                    <p>
                        Already have an account?

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </p>

                </div>


                {/* Footer */}
                <div className="register-footer">

                    <p>
                        Your health information is protected
                        and handled securely.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;
