import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useBotStatus() {
  return useQuery({
    queryKey: [api.status.get.path],
    queryFn: async () => {
      const res = await fetch(api.status.get.path);
      if (!res.ok) throw new Error("Failed to fetch bot status");
      return api.status.get.responses[200].parse(await res.json());
    },
    // Refresh status every 30 seconds
    refetchInterval: 30000, 
  });
}
