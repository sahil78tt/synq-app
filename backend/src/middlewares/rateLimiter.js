import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiter: 5 requests per user every 15 minutes
const aiSummarizationLimiter = new RateLimiterMemory({
  points: 5,
  duration: 30 * 60, // 30 minutes,
  blockDuration: 0,
  keyPrefix: "ai_summarize",
});

export const rateLimitSummarization = async (req, res, next) => {
  try {
    // Ensure authenticated user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Unauthorized: User authentication required",
      });
    }

    const userId = req.user._id.toString();

    // Consume one request token
    const rateLimiterRes = await aiSummarizationLimiter.consume(userId, 1);

    // Optional rate limit headers
    res.set({
      "X-RateLimit-Limit": 5,
      "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
      "X-RateLimit-Reset": new Date(
        Date.now() + rateLimiterRes.msBeforeNext,
      ).toISOString(),
    });

    next();
  } catch (rateLimiterError) {
    // Unexpected error
    if (rateLimiterError instanceof Error) {
      console.error("Rate limiter error:", rateLimiterError.message);
      return res.status(500).json({
        message: "Internal server error during rate limiting",
      });
    }

    // Rate limit exceeded
    const timeUntilReset = Math.ceil(rateLimiterError.msBeforeNext / 1000);
    const minutesUntilReset = Math.ceil(timeUntilReset / 60);

    return res.status(429).json({
      message: `Rate limit exceeded. You can make 5 summarization requests every 30 minutes. Please try again in ${
        minutesUntilReset
      } minute${minutesUntilReset !== 1 ? "s" : ""}.`,
      retryAfter: timeUntilReset,
      limit: 5,
      windowMinutes: 30,
    });
  }
};

//  Reset rate limit for a specific user

export const resetUserRateLimit = async (userId) => {
  try {
    await aiSummarizationLimiter.delete(userId);
    console.log(`Rate limit reset for user: ${userId}`);
  } catch (error) {
    console.error("Failed to reset rate limit:", error.message);
  }
};
