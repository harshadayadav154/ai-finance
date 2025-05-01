import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "wealthwise-app",
  name: "Wealthwise",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2, // Retry up to 2 times
  }),
});
