"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setIsLoading(false);
    } else {
      router.push("/admin"); // Akan dicegat middleware jika bukan admin
      router.refresh();
    }
  };

  return (
    <div className="login-page">
      {/* Login Container */}
      <main className="login-card">
        <div className="login-card-inner">
          {/* Brand & Headline */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "28px",
                  fontVariationSettings: "'FILL' 1",
                  color: "white",
                }}
              >
                diamond
              </span>
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Enter your credentials to access your portal.
            </p>
          </div>



          {/* Error */}
          {error && (
            <div className="login-error">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                error
              </span>
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="login-field-group">
              <label htmlFor="email" className="login-label">
                Email Address
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon material-symbols-outlined">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="login-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon material-symbols-outlined">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input login-input-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-visibility-btn"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="login-remember">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <label htmlFor="remember" className="login-remember-label">
                Remember Me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-btn"
            >
              {isLoading ? (
                <div className="login-spinner" />
              ) : (
                <>
                  Sign In
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="login-signup-text">
            Don&apos;t have an account?{" "}
            <Link href="/daftar" className="login-signup-link">
              Request Access
            </Link>
          </p>
        </div>
      </main>

      {/* Demo Credentials */}
      <div className="login-demo-credentials">
        <p className="login-demo-title">Demo Credentials:</p>
        <div className="login-demo-list">
          <p>
            Owner: <code>owner@system.local</code> /{" "}
            <code>admin123</code>
          </p>
          <p>
            Super Admin: <code>admin@system.local</code> /{" "}
            <code>admin123</code>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <Link href="#">Privacy Policy</Link>
        <span>•</span>
        <Link href="#">Terms of Service</Link>
        <span>•</span>
        <Link href="#">Support</Link>
      </footer>
    </div>
  );
}
