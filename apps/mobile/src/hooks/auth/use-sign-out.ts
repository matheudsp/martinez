import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function useSignOut() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      // Clear all cached queries on sign-out so stale data
      // isn't shown to the next user on this device.
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut, isLoading };
}
