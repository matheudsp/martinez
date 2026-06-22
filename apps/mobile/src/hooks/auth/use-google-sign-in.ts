import * as Linking from "expo-linking";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Better Auth opens Google OAuth in the native browser.
      // After auth, Google redirects to /api/auth/callback/google on the server,
      // which then redirects back to the app via this deep link.
      const callbackURL = Linking.createURL("/");

      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (signInError) {
        setError(signInError.message ?? "Google sign-in failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}
