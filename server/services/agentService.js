const { ChatGroq } = require("@langchain/groq");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
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
  const getClimateScoreTool = new DynamicStructuredTool({
    name: "get_current_climate_score",
    description: "Get the current Bangladesh investment climate index score (0-100) and the accompanying AI narrative summary.",
    schema: z.object({}),
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
  const queryDatabaseTool = new DynamicStructuredTool({
    name: "query_investment_database",
    description: "Query the database of scraped investment articles using specific filters. " +
                 "Set include_archived to true to search the past 60 days of news, otherwise it defaults to the last 7 days.",
    schema: z.object({
      sentiment: z.enum(["opportunity", "risk", "regulation"]).optional().describe("Filter by sentiment category"),
      search: z.string().optional().describe("Keyword search query term"),
      region: z.enum(["local", "global"]).optional().describe("Filter by region: local = Bangladesh only, global = international only"),
      min_impact: z.number().optional().describe("Filter by minimum impact score (0-100)"),
      max_impact: z.number().optional().describe("Filter by maximum impact score (0-100)"),
      limit: z.number().optional().describe("Max number of articles to return (default 20, max limit 50 to prevent token limits)"),
      include_archived: z.boolean().optional().describe("Set to true to search the 60-day historical archive instead of 7 days")
    }),
    func: async (params) => {
      try {
        // Enforce a safety limit ceiling of 50 to prevent Groq TPM (Tokens Per Minute) limit crashes (413 Request Too Large)
        const limit = Math.min(params.limit || 20, 50);
        
        const queryParams = {
          sentiment: params.sentiment,
          search: params.search,
          limit: limit,
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
        
        // Dynamically compress article details for larger sets to save tokens
        const summary = filtered.map((a, i) => {
          const baseStr = `${i+1}. [${a.source}] ${a.title} | Sentiment: ${a.sentiment} | Impact: ${a.impact_score}/100 | Region: ${a.region}`;
          
          if (filtered.length <= 12) {
            // Render full metadata including URL and AI explanation only for smaller result lists
            return `${baseStr}\n` +
              `   - Ingested: ${a.created_at.slice(0, 10)} | URL: ${a.url}\n` +
              `   - AI Brief: "${a.ai_rationale || 'No rationale available'}"`;
          }
          
          // Compact format: omit long URLs and AI briefs for bulk list to avoid TPM rate limit exhaustion (413)
          return baseStr;
        }).join('\n\n');
        
        return `Found ${filtered.length} matching articles in the database:\n\n${summary}`;
      } catch (err) {
        return `Failed to execute query: ${err.message}. Parameters were: ${JSON.stringify(params)}`;
      }
    }
  });

  // Tool 3: Get breakdown of news coverage by country/region of origin (with archive support)
  const getCoverageByCountryTool = new DynamicStructuredTool({
    name: "get_coverage_by_country",
    description: "Get a statistical breakdown of which countries or regions are publishing investment news in our database.",
    schema: z.object({
      include_archived: z.boolean().optional().describe("Set to true to search the 60-day historical archive instead of the default 7-day dashboard window")
    }),
    func: async (params) => {
      try {
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
        return `Error compiling country coverage stats: ${err.message}. Parameters were: ${JSON.stringify(params)}`;
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
