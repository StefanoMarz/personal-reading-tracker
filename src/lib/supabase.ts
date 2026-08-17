import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY;

// Un errore esplicito qui rende subito comprensibile una configurazione locale
// incompleta, invece di produrre errori di rete poco chiari durante l'uso dell'app.
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY"
  );
}

// Questo e l'unico client condiviso dall'applicazione. La publishable key puo
// essere usata nel browser: l'accesso alle righe e protetto dalle policy RLS.
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
