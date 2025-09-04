const MIRAEL_CHAT_SUMMARIZATION_INSTRUCTIONS =
  `Summarize the conversation for Mirael (emotional AI helping high-functioning women).

Input: {messages} | Previous: {previous_summary}

Output: 1-2 paragraph narrative summary with neutral, professional tone. Capture key emotional states, themes, and user journey. No advice - summarize only.`.trim();

export default MIRAEL_CHAT_SUMMARIZATION_INSTRUCTIONS;
