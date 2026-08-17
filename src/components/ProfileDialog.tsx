import { useEffect, useRef, useState, type FormEvent } from "react";
import type {
  AuthProfile,
  UpdateProfileResult,
} from "../hooks/useAuth";

type ProfileDialogProps = {
  profile: AuthProfile;
  onClose: () => void;
  onUpdateProfile: (
    firstName: string,
    lastName: string,
    email: string
  ) => Promise<UpdateProfileResult>;
};

export const ProfileDialog = ({
  profile,
  onClose,
  onUpdateProfile,
}: ProfileDialogProps) => {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstNameInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter both your first name and last name.");
      return;
    }

    setIsSubmitting(true);

    const result = await onUpdateProfile(
      firstName.trim(),
      lastName.trim(),
      email.trim()
    );

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setMessage(
      result.emailChangeRequested
        ? "Profile updated. Check your current and new email inboxes to confirm the email change."
        : "Profile updated successfully."
    );
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
              Account
            </p>
            <h2
              id="profile-dialog-title"
              className="mt-2 text-2xl font-semibold text-white"
            >
              Edit profile
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close profile dialog"
            className="rounded-lg px-3 py-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              First name
              <input
                ref={firstNameInputRef}
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                maxLength={60}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Last name
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                maxLength={60}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
              />
            </label>
          </div>

          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
            />
          </label>

          <p className="text-xs text-slate-500">
            Changing your email requires confirmation before the new address
            becomes active.
          </p>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-emerald-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-violet-500 px-4 py-2.5 font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </form>
      </section>
    </div>
  );
};
