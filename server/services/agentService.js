const { ChatGroq } = require("@langchain/groq");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { DynamicTool } = require("@langchain/core/tools");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

const models = require('../models');
const { generateExecutiveSummary } = require('./aiValidator');

// Helper to get a valid Groq API key from rotation
function getGroqApiKey() {
  const keys = [];
  if (process.env.GROQ_API_KEY_1) keys.push(process.env.GROQ_API_KEY_1);
  if (process.env.GROQ_API_KEY_2) keys.push(process.env.GROQ_API_KEY_2);
  if (process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY);
  
  if (keys.length === 0) return null;
  // Use the first key for the agent chat service
  return keys[0];
}

async function runAgent(userMessage) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Groq API Key is not configured in the environment.');
  }

  // 1. Initialize LangChain ChatGroq model
  const llm = new ChatGroq({
    apiKey: apiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
  });

  // 2. Define Custom Agent Tools
  
  // Tool 1: Get current climate score
  const getClimateScoreTool = new DynamicTool({
    name: "get_current_climate_score",
    description: "Get the current Bangladesh investment climate index score (0-100) and the accompanying AI narrative summary.",
    func: async () => {
      try {
        const { data: articles, error } = await models.getArticles({ limit: 500 });
        if (error || !articles || articles.length === 0) {
          return "No active articles found in the database. Cannot calculate score.";
        }
        const summary = await generateExecutiveSummary(articles);
        return `Current Score: ${summary.weightedScore}/100. AI Executive Brief: "${summary.narrative}"`;
      } catch (err) {
        return `Error fetching climate score: ${err.message}`;
      }
    }
  });

  // Tool 2: Search investment articles
  const searchNewsTool = new DynamicTool({
    name: "search_investment_news",
    description: "Search the database for recently scraped articles about a specific topic. Input should be a search query string (e.g., 'inflation', 'port', 'infrastructure').",
    func: async (query) => {
      try {
        const { data: articles, error } = await models.getArticles({ search: query, limit: 10 });
        if (error) return `Error searching articles: ${error}`;
        if (!articles || articles.length === 0) {
          return `No articles found matching the query "${query}".`;
        }
        
        const summaryList = articles.map((a, i) => 
          `${i+1}. [${a.source}] ${a.title} (Sentiment: ${a.sentiment}, Impact Score: ${a.impact_score}/100)`
        ).join('\n');
        
        return `Found ${articles.length} articles matching "${query}":\n${summaryList}`;
      } catch (err) {
        return `Error searching articles: ${err.message}`;
      }
    }
  });

  const tools = [getClimateScoreTool, searchNewsTool];

  // 3. Define Prompt Structure (matches LangChain expectations)
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system", 
      "You are the official BIDA Macro-Intelligence Chat Agent. " +
      "You assist public officials in analyzing the Bangladesh investment climate, " +
      "national sentiment index, and international press coverage.\n\n" +
      "You have access to tools that fetch live data from the database. Always use these tools " +
      "whenever the user asks about the climate score, current news, trends, or specific topics. " +
      "Be specific, professional, and base your answers strictly on the facts returned by the tools."
    ],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // 4. Build Agent and Executor
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  // 5. Invoke the executor
  const result = await executor.invoke({
    input: userMessage,
  });

  return result.output;
}

module.exports = { runAgent };
