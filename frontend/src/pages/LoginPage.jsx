import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function LoginPage() {
  const { login, googleLogin, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError("");
      try {
        // Get user info from Google using access token
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );

        // Send user info to backend
        const result = await googleLogin({
          email: userInfo.data.email,
          name: userInfo.data.name,
          picture: userInfo.data.picture,
          googleId: userInfo.data.sub,
        });

        if (result.success) {
          navigate("/");
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Google login failed. Please try again.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
    },
  });

  const isButtonDisabled = isLoading || isGoogleLoading;

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
              disabled={isButtonDisabled}
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border dark:bg-border-dark"></div>
            <span className="text-xs text-muted dark:text-muted-dark uppercase tracking-wide">
              or
            </span>
            <div className="flex-1 h-px bg-border dark:bg-border-dark"></div>
          </div>

          {/* Custom Google Login Button */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={isButtonDisabled}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-surface dark:bg-surface-dark/50 border border-border dark:border-border-dark text-charcoal dark:text-[#f0f0ee] text-sm font-medium disabled:opacity-40 hover:bg-border/50 dark:hover:bg-border-dark/50 transition-colors duration-200"
          >
            {isGoogleLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Connecting…
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

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
