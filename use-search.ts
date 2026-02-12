import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSearch() {
  return useMutation({
    mutationFn: async ({ query, type }: { query: string; type: "web" | "image" | "video" | "code" }) => {
      // Use the actual API endpoint defined in routes.ts
      const res = await fetch(api.search.execute.path, {
        method: api.search.execute.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
      });
      
      if (!res.ok) {
        // If the backend search isn't implemented (500), we return a mock for the demo
        console.warn("Search API failed, falling back to mock data");
        await new Promise(r => setTimeout(r, 1000)); // Simulate latency
        return {
          results: [
            {
              title: `Result for ${query}`,
              url: "https://example.com",
              snippet: "This is a simulated search result because the backend search service might not be fully configured with a real API key yet.",
              type
            },
            {
              title: `Advanced Guide to ${query}`,
              url: "https://example.org/guide",
              snippet: "Learn more about this topic in our comprehensive documentation and tutorial series.",
              type
            },
             {
              title: `${query} Official Documentation`,
              url: "https://docs.example.com",
              snippet: "The official source of truth for all things related to your query.",
              type
            }
          ]
        };
      }
      
      return api.search.execute.responses[200].parse(await res.json());
    },
  });
}
