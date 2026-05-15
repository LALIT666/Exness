import { useNavigate } from "react-router-dom";
import { signInUser } from "../api/trade.api";
import { useState } from "react";

export default function Signin() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("mail");
    const password = formData.get("pass");

    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await signInUser(email as string, password as string);

      if (response?.token) {
        localStorage.setItem("token", response.token);
        navigate("/trading");
      } else {
        setErrorMessage(response?.message ?? "Invalid credentials");
      }
    } catch {
      setErrorMessage("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToSignup() {
    localStorage.removeItem("token");
    navigate("/signup");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-neutral-200 rounded-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Access your trading dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              name="mail"
              placeholder="you@example.com"
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              name="pass"
              placeholder="Enter your password"
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500">
          Don't have an account?{" "}
          <button
            onClick={goToSignup}
            className="text-black font-medium hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
