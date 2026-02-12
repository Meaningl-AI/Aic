import { useMutation } from "@tanstack/react-query";

export function useGenerateImage() {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1024x1024" }),
      });
      
      if (!res.ok) throw new Error("Failed to generate image");
      return res.json() as Promise<{ url?: string; b64_json?: string; download?: string }>;
    },
  });
}
