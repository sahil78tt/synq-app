import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getInitials } from "../lib/utils";
import { DEFAULT_AVATAR } from "../constants";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const { authUser, updateProfile, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [preview, setPreview] = useState(authUser?.profilePic || "");
  const [imageData, setImageData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setImageData(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    if (!fullName.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    const payload = { fullName: fullName.trim() };
    if (imageData) payload.profilePic = imageData;

    const result = await updateProfile(payload);
    if (result.success) {
      setSuccess(true);
      setImageData(null);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <Link
              to="/"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] hover:bg-panel dark:hover:bg-panel-dark border border-border dark:border-border-dark transition-colors duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <h1 className="font-display text-xl text-charcoal dark:text-[#f0f0ee]">Profile</h1>
              <p className="text-xs text-muted dark:text-muted-dark">Manage your account</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-4">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide mb-4">
              Photo
            </p>
            <div className="flex items-center gap-5">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border border-border dark:border-border-dark"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent text-lg font-display flex items-center justify-center border border-border dark:border-border-dark">
                    {getInitials(authUser?.fullName)}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
                  aria-label="Change photo"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              </div>
              <div>
                <p className="text-sm text-charcoal dark:text-[#f0f0ee] font-medium">
                  {authUser?.fullName}
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] transition-colors duration-200 mt-0.5"
                >
                  Change photo
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Info */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-4">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide mb-4">
              Information
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted dark:text-muted-dark">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-surface dark:bg-surface-dark/50 border border-border dark:border-border-dark rounded-xl text-charcoal dark:text-[#f0f0ee] outline-none focus:ring-1 focus:ring-accent/40 transition-shadow duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted dark:text-muted-dark">Email</label>
                <input
                  type="email"
                  value={authUser?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 text-sm bg-surface dark:bg-surface-dark/30 border border-border dark:border-border-dark rounded-xl text-muted dark:text-muted-dark cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 dark:text-rose-400 mb-3">{error}</p>}
          {success && <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">Profile updated.</p>}

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal text-sm font-medium disabled:opacity-40 hover:opacity-80 transition-opacity duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </button>

          {/* Meta */}
          <div className="mt-6 bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl p-5">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide mb-3">
              Account
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted dark:text-muted-dark">Member since</span>
                <span className="text-charcoal dark:text-[#f0f0ee]">
                  {authUser?.createdAt
                    ? new Date(authUser.createdAt).toLocaleDateString([], { month: "long", year: "numeric" })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted dark:text-muted-dark">Status</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
