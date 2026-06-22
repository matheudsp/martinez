import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/lib/api-client";
import type { UpdateUserInput } from "@/types/api.types";

export const currentUserKeys = {
  all: ["users", "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKeys.all,
    queryFn: () => usersApi.me().then((r) => r.user),
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersApi.updateMe(input).then((r) => r.user),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(currentUserKeys.all, updatedUser);
    },
  });
}
