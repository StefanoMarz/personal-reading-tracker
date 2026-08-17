import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type SignUpResult = {
  error: string | null;
  requiresEmailConfirmation: boolean;
};

export type UpdateProfileResult = {
  error: string | null;
  emailChangeRequested: boolean;
};

export type AuthProfile = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  initials: string;
};

const readMetadataText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const getAuthProfile = (session: Session | null): AuthProfile | null => {
  if (!session) {
    return null;
  }

  // I metadati possono essere modificati dall'utente: li normalizziamo e li
  // usiamo solo per la presentazione, mai per autorizzare l'accesso ai dati.
  const firstName = readMetadataText(
    session.user.user_metadata.first_name
  );
  const lastName = readMetadataText(session.user.user_metadata.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = session.user.email ?? "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    email.charAt(0).toUpperCase() ||
    "R";

  return {
    firstName,
    lastName,
    fullName: fullName || "Reader",
    email,
    initials,
  };
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authInitializationError, setAuthInitializationError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    // Supabase salva la sessione nel browser. La recuperiamo all'avvio per
    // mantenere l'accesso anche dopo un refresh della pagina.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthInitializationError(error.message);
      }

      setSession(data.session);
      setIsAuthLoading(false);
    });

    // Questo listener mantiene React sincronizzato con login, logout e rinnovo
    // automatico del token senza interrogare Supabase in ogni componente.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return error?.message ?? null;
  };

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        },
      },
    });

    return {
      error: error?.message ?? null,
      // Con la conferma email attiva Supabase crea l'utente, ma non apre una
      // sessione finche non viene selezionato il link ricevuto via email.
      requiresEmailConfirmation: Boolean(data.user && !data.session),
    };
  };

  const signOut = async () => {
    // "local" chiude la sessione di questo browser senza scollegare gli altri
    // dispositivi su cui lo stesso utente potrebbe avere effettuato l'accesso.
    const { error } = await supabase.auth.signOut({ scope: "local" });

    return error?.message ?? null;
  };

  const updateProfile = async (
    firstName: string,
    lastName: string,
    email: string
  ): Promise<UpdateProfileResult> => {
    if (!session) {
      return {
        error: "You need to sign in before editing your profile.",
        emailChangeRequested: false,
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const currentEmail = session.user.email?.toLowerCase() ?? "";
    const emailChangeRequested = normalizedEmail !== currentEmail;

    const { error } = await supabase.auth.updateUser(
      {
        ...(emailChangeRequested ? { email: normalizedEmail } : {}),
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        },
      },
      {
        // Il nuovo indirizzo diventa effettivo solo dopo il flusso di conferma
        // configurato in Supabase; al termine l'utente torna all'applicazione.
        emailRedirectTo: window.location.origin,
      }
    );

    return {
      error: error?.message ?? null,
      emailChangeRequested,
    };
  };

  return {
    session,
    userId: session?.user.id ?? null,
    profile: getAuthProfile(session),
    isAuthLoading,
    authInitializationError,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};
