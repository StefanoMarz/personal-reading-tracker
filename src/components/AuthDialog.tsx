import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SignUpResult } from "../hooks/useAuth";

type AuthMode = "sign-in" | "sign-up";

type AuthDialogProps = {
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<SignUpResult>;
};

export const AuthDialog = ({
  onClose,
  onSignIn,
  onSignUp,
}: AuthDialogProps) => {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailInputRef.current?.focus();

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

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setPasswordConfirmation("");
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      mode === "sign-up" &&
      (!firstName.trim() || !lastName.trim())
    ) {
      setError("Enter both your first name and last name.");
      return;
    }

    if (mode === "sign-up" && password !== passwordConfirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "sign-in") {
      const signInError = await onSignIn(email.trim(), password);

      if (signInError) {
        setError(signInError);
        setIsSubmitting(false);
        return;
      }

      onClose();
      return;
    }

    const result = await onSignUp(
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      password
    );

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setMessage(
        "Account created. Check your email and confirm the address before signing in."
      );
      setPassword("");
      setPasswordConfirmation("");
      setIsSubmitting(false);
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
              Personal Reading Tracker
            </p>
            <h2
              id="auth-dialog-title"
              className="mt-2 text-2xl font-semibold text-white"
            >
              {mode === "sign-in" ? "Sign in" : "Create your account"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close authentication dialog"
            className="rounded-lg px-3 py-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => changeMode("sign-in")}
            aria-pressed={mode === "sign-in"}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "sign-in"
                ? "bg-violet-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => changeMode("sign-up")}
            aria-pressed={mode === "sign-up"}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "sign-up"
                ? "bg-violet-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create account
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                First name
                <input
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
          )}

          <label className="block text-sm text-slate-300">
            Email
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={8}
              required
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
            />
          </label>

          {mode === "sign-up" && (
            <label className="block text-sm text-slate-300">
              Confirm password
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
              />
            </label>
          )}

          <p className="text-xs text-slate-500">
            Use at least 8 characters. Guests can continue without creating an
            account.
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
            {isSubmitting
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue as guest
          </button>
        </form>
      </section>
    </div>
  );
};
