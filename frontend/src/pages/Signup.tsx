import { useNavigate } from "react-router-dom";
import { signUpUser } from "../api/trade.api";
import { useEffect, useState } from "react";

export default function Signup() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const alreadyLoggedIn = localStorage.getItem("userID") !== null;

    if (alreadyLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("mail");
    const password = formData.get("pass");

    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await signUpUser(email as string, password as string);

      if (response?.userId) {
        localStorage.setItem("userID", response.userId);
        navigate("/signin");
      } else {
        setErrorMessage(response?.message ?? "Signup failed");
      }
    } catch {
      setErrorMessage("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-neutral-200 rounded-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Start trading in minutes.
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
              placeholder="Minimum 6 characters"
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-black font-medium hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
