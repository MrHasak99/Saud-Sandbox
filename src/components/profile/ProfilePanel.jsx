import { useEffect, useRef, useState } from "react";
import { X, UserCircle } from "lucide-react";
import ProfileEmptyState from "./ProfileEmptyState";
import ProfileSummary from "./ProfileSummary";
import ProfileForm from "./ProfileForm";
import { emptyProfile } from "../../lib/profileStorage";

// The modal that holds the whole dietary profile feature: a friendly empty
// state, a read-only summary, and an edit form — all in one place so
// Storefront only needs to know whether it's open or closed.
export default function ProfilePanel({ open, onClose, profile, hasProfile, onSave, onClear }) {
  const [mode, setMode] = useState(hasProfile ? "view" : "empty");
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const savedTimeoutRef = useRef(null);

  // Decide what to show fresh every time the panel is opened.
  useEffect(() => {
    if (open) {
      setMode(hasProfile ? "view" : "empty");
      setSaveError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on Escape, same pattern as the chat widget.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Clear any pending "saved" banner timeout if the panel closes early.
  useEffect(() => () => clearTimeout(savedTimeoutRef.current), []);

  if (!open) return null;

  const handleSave = (nextProfile) => {
    const ok = onSave(nextProfile);
    if (ok) {
      setMode("view");
      setSaveError(null);
      setJustSaved(true);
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setJustSaved(false), 4000);
    } else {
      setSaveError("Could not save your profile. Your browser storage may be full or disabled.");
    }
  };

  const handleClear = () => {
    onClear();
    setMode("empty");
    setJustSaved(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Dietary profile"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2 rounded-t-2xl border-b border-slate-100 px-5 py-4">
          <div className="rounded-full bg-emerald-50 p-1.5">
            <UserCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Dietary profile</p>
            <p className="text-xs text-slate-500">Saved only on this device — not sent anywhere</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {mode === "empty" && <ProfileEmptyState onStart={() => setMode("edit")} />}

          {mode === "view" && (
            <ProfileSummary
              profile={profile}
              justSaved={justSaved}
              onEdit={() => setMode("edit")}
              onClear={handleClear}
            />
          )}

          {mode === "edit" && (
            <>
              {saveError && (
                <p className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{saveError}</p>
              )}
              <ProfileForm
                initialProfile={hasProfile ? profile : emptyProfile()}
                onSave={handleSave}
                onCancel={() => setMode(hasProfile ? "view" : "empty")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
