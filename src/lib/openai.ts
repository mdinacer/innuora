import OpenAI from "openai";

const openai = new OpenAI();

// const openai = new OpenAI({
//   baseURL: "https://api.openai.com/v1/models",
//   //baseURL: "https://openrouter.ai/api/v1",
//   apiKey: getRequiredEnvVar("OPEN_ROUTER_API_KEY"),
//   //   defaultHeaders: {
//   //     "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//   //     "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//   //   },
// });

export default openai;
