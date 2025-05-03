import OpenAI from 'openai';

let openai = null;

// Get environment variables with defaults
const getMaxTokens = () => {
  const envMaxTokens = process.env.REACT_APP_CHAT_MAX_TOKENS;
  return envMaxTokens ? parseInt(envMaxTokens, 10) : 200;
};

const getTemperature = () => {
  const envTemperature = process.env.REACT_APP_CHAT_TEMPERATURE;
  return envTemperature ? parseFloat(envTemperature) : 0.7;
};

// Initialize OpenAI client
export const initOpenAI = (apiKey) => {
  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Note: In production, you should use a backend proxy
  });
  return openai;
};

// Get OpenAI client
export const getOpenAI = () => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initOpenAI first.');
  }
  return openai;
};

// Send a message to ChatGPT and get a response
export const sendMessageToGPT = async (messages) => {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: getTemperature(),
      max_tokens: getMaxTokens(),
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};

// Create a system message for the behavioral interviewer
export const createInterviewerSystemMessage = () => {
  return {
    role: "system",
    content: `You are a professional behavioral interviewer conducting a job interview. Keep your responses concise with short sentences. Your role is to assess the candidate's qualifications, experience, and fit for the position.

Guidelines:
1. Ask one question at a time and wait for the candidate's response.
2. Start with a brief introduction.
3. Focus on behavioral questions about specific experiences.
4. Examples:
   - "Tell me about a challenge at work. How did you handle it?"
   - "Describe a time you worked in a team to solve a problem."
   - "When did you adapt to a significant change?"
5. Ask follow-up questions when needed.
6. Tailor questions based on their resume/job description.
7. Be professional but friendly.
8. Keep your feedback brief.
9. Ask 5-7 questions total.
10. When ending the interview, say "INTERVIEW COMPLETE" at the start of your final message.
11. In your final message, provide a letter grade (A+, A, B, C, D, or F) based on their overall performance.
12. Format your final evaluation as: "Your interview score: [GRADE]" at the end of your message.

Begin by introducing yourself briefly, then ask your first question.`
  };
};

// For backward compatibility
export const createInterviewerLegacyMessage = createInterviewerSystemMessage;
export const createInterviewProSystemMessage = createInterviewerSystemMessage; 