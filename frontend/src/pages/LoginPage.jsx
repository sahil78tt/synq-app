import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    const result = await login(form);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Form Side */}
      <div className="flex flex-col items-center justify-center px-8 sm:px-12 py-16 bg-panel dark:bg-panel-dark">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="font-display text-2xl text-charcoal dark:text-[#f0f0ee] mb-2">
              Welcome back
            </p>
            <p className="text-sm text-muted dark:text-muted-dark">
              Sign in to continue to SynQ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-charcoal dark:text-[#c0c0be] tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 text-sm bg-surface dark:bg-surface-dark/50 border border-border dark:border-border-dark rounded-xl text-charcoal dark:text-[#f0f0ee] placeholder:text-muted dark:placeholder:text-muted-dark outline-none focus:ring-1 focus:ring-accent/40 transition-shadow duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-charcoal dark:text-[#c0c0be] tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 text-sm bg-surface dark:bg-surface-dark/50 border border-border dark:border-border-dark rounded-xl text-charcoal dark:text-[#f0f0ee] placeholder:text-muted dark:placeholder:text-muted-dark outline-none focus:ring-1 focus:ring-accent/40 transition-shadow duration-200"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 rounded-xl bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal text-sm font-medium disabled:opacity-40 hover:opacity-80 transition-opacity duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted dark:text-muted-dark">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-charcoal dark:text-[#f0f0ee] underline underline-offset-2 hover:text-accent transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Illustration Side */}
      <AuthImagePattern
        title="Pick up where you left off."
        subtitle="Your conversations are waiting. Sign in to reconnect."
      />
    </div>
  );
}
