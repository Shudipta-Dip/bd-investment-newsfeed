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

  // Tool 2: Advanced Database Query Tool
  const queryDatabaseTool = new DynamicTool({
    name: "query_investment_database",
    description: "Query the database of scraped investment articles using filters. " +
                 "Input MUST be a JSON string. Any of these fields are optional: " +
                 "{ \"sentiment\": \"opportunity\"|\"risk\"|\"regulation\", \"search\": \"keyword\", \"region\": \"local\"|\"global\", \"min_impact\": number, \"max_impact\": number, \"limit\": number, \"include_archived\": boolean }. " +
                 "Set \"include_archived\": true to search the past 60 days of news, otherwise it searches only the last 7 days. " +
                 "Example input: { \"search\": \"FDI\", \"include_archived\": true, \"sentiment\": \"opportunity\" }",
    func: async (jsonInput) => {
      try {
        let params = {};
        if (jsonInput && jsonInput.trim() !== "") {
          // Clean possible markdown wrapper if the agent formats it as ```json ... ```
          let cleaned = jsonInput.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          params = JSON.parse(cleaned);
        }
        
        const queryParams = {
          sentiment: params.sentiment,
          search: params.search,
          limit: params.limit || 100,
          daysLimit: params.include_archived ? 60 : 7,
        };
        
        if (params.region) {
          queryParams.region = params.region === 'local' ? 'Bangladesh' : 'global';
        }
        
        const { data: articles, error } = await models.getArticles(queryParams);
        if (error) return `Error fetching articles: ${error}`;
        if (!articles || articles.length === 0) {
          return `No articles found matching filters: ${JSON.stringify(params)}`;
        }
        
        let filtered = articles;
        if (typeof params.min_impact === 'number') {
          filtered = filtered.filter(a => (a.impact_score || 0) >= params.min_impact);
        }
        if (typeof params.max_impact === 'number') {
          filtered = filtered.filter(a => (a.impact_score || 0) <= params.max_impact);
        }
        
        if (filtered.length === 0) {
          return `Articles found in DB, but none matched impact range limits: min_impact=${params.min_impact}, max_impact=${params.max_impact}`;
        }
        
        const summary = filtered.map((a, i) =>
          `${i+1}. [${a.source}] ${a.title}\n` +
          `   - Sentiment: ${a.sentiment} | Impact: ${a.impact_score}/100 | Region: ${a.region}\n` +
          `   - Ingested: ${a.created_at.slice(0, 10)} | URL: ${a.url}\n` +
          `   - AI Brief: "${a.ai_rationale || 'No rationale available'}"`
        ).join('\n\n');
        
        return `Found ${filtered.length} matching articles in the database:\n\n${summary}`;
      } catch (err) {
        return `Failed to execute query: ${err.message}. Ensure your input is a valid JSON string. Input was: ${jsonInput}`;
      }
    }
  });

  // Tool 3: Get breakdown of news coverage by country/region of origin (with archive support)
  const getCoverageByCountryTool = new DynamicTool({
    name: "get_coverage_by_country",
    description: "Get a statistical breakdown of which countries or regions are publishing investment news in our database. " +
                 "Input must be a JSON string: { \"include_archived\": boolean }. Set to true to search the 60-day archive instead of the default 7-day dashboard window.",
    func: async (jsonInput) => {
      try {
        let params = {};
        if (jsonInput && jsonInput.trim() !== "") {
          let cleaned = jsonInput.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          params = JSON.parse(cleaned);
        }
        
        const daysLimit = params.include_archived ? 60 : 7;
        const { data: articles, error } = await models.getArticles({ limit: 1000, daysLimit });
        
        if (error) return `Error fetching coverage stats: ${error}`;
        if (!articles || articles.length === 0) {
          return `No active articles in the database for the selected ${daysLimit}-day window.`;
        }
        
        const counts = {};
        articles.forEach(a => {
          const reg = a.region || "International";
          counts[reg] = (counts[reg] || 0) + 1;
        });
        
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([region, count]) => ` - ${region}: ${count} article(s) (${Math.round((count/articles.length)*100)}%)`)
          .join('\n');
          
        return `Breakdown of investment news coverage counts by country/region of origin (${daysLimit}-day window):\n${sorted}`;
      } catch (err) {
        return `Error compiling country coverage stats: ${err.message}. Input was: ${jsonInput}`;
      }
    }
  });

  const tools = [getClimateScoreTool, queryDatabaseTool, getCoverageByCountryTool];

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
