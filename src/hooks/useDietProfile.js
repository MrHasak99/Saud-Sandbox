import { useCallback, useEffect, useState } from "react";
import { emptyProfile, loadProfile, saveProfile, clearProfile } from "../lib/profileStorage";

// Gives any component access to the customer's saved dietary profile,
// backed by localStorage. `hasProfile` tells the UI whether the customer
// has ever saved anything, so it can show a friendly empty state first.
export function useDietProfile() {
  const [profile, setProfile] = useState(emptyProfile());
  const [hasProfile, setHasProfile] = useState(false);

  // Load whatever was saved, once, when the app starts.
  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfile(saved);
      setHasProfile(true);
    }
  }, []);

  const save = useCallback((nextProfile) => {
    const ok = saveProfile(nextProfile);
    if (ok) {
      setProfile(nextProfile);
      setHasProfile(true);
    }
    return ok;
  }, []);

  const clear = useCallback(() => {
    clearProfile();
    setProfile(emptyProfile());
    setHasProfile(false);
  }, []);

  return { profile, hasProfile, save, clear };
}
