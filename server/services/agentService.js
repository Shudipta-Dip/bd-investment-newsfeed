const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatGroq } = require("@langchain/groq");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

const models = require('../models');
const { generateExecutiveSummary } = require('./aiValidator');

// ---------------------------------------------------------------------------
// LLM Initialization — Groq primary (temperature 0), Gemini fallback
// ---------------------------------------------------------------------------
function buildLLM() {
  const llmOptions = [];

  // Primary: Groq (Llama 3.3 70B) for ultra-fast, unthrottled response times
  const groqKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY,
  ].filter(Boolean);

  for (const key of groqKeys) {
    llmOptions.push(new ChatGroq({
      apiKey: key,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      maxTokens: 1024,
    }));
  }

  // Fallback: Gemini 2.0 Flash (via dedicated chat key)
  if (process.env.GEMINI_API_KEY_4) {
    llmOptions.push(new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY_4,
      model: "gemini-2.0-flash",
      temperature: 0,
      maxOutputTokens: 1024,
    }));
  }

  if (llmOptions.length === 0) {
    throw new Error('No LLM API keys configured. Set GROQ_API_KEY_* or GEMINI_API_KEY_4 in environment.');
  }

  if (llmOptions.length === 1) return llmOptions[0];
  return llmOptions[0].withFallbacks(llmOptions.slice(1));
}

// ---------------------------------------------------------------------------
// Agent Tools
// ---------------------------------------------------------------------------

// Tool 1: Get current climate score
function buildClimateScoreTool() {
  return new DynamicStructuredTool({
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
}

// Tool 2: Advanced Database Query Tool
function buildQueryDatabaseTool() {
  return new DynamicStructuredTool({
    name: "query_investment_database",
    description:
      "Query the BIDA internal database of scraped investment articles using specific filters. " +
      "By default, this searches the 60-day archive to make sure all news are fetched. " +
      "IMPORTANT: The output of this tool is VERIFIED factual data from the database. " +
      "You MUST reproduce all names, metrics, and actions exactly as returned.",
    schema: z.object({
      sentiment: z.enum(["opportunity", "risk", "regulation"]).optional().describe("Filter by sentiment category"),
      search: z.string().optional().describe("Keyword search query term"),
      region: z.enum(["local", "global"]).optional().describe("Filter by region: local = Bangladesh only, global = international only"),
      country: z.string().optional().describe("Filter by specific country/region name (e.g. 'Cambodia', 'Sweden', 'New Zealand', 'United States')"),
      min_impact: z.number().optional().describe("Filter by minimum impact score (0-100)"),
      max_impact: z.number().optional().describe("Filter by maximum impact score (0-100)"),
      limit: z.number().optional().describe("Max number of articles to return (default 20, max limit 50)"),
      include_archived: z.boolean().optional().describe("Defaults to true to search 60 days. Set to false to restrict search to only the last 7 days.")
    }),
    func: async (params) => {
      try {
        const limit = Math.min(params.limit || 20, 50);
        // Default to true (60 days) to prevent missing older news
        const searchArchive = params.include_archived !== false;

        const queryParams = {
          sentiment: params.sentiment,
          search: params.search,
          limit: limit,
          daysLimit: searchArchive ? 60 : 7,
        };

        if (params.region) {
          queryParams.region = params.region;
        }

        if (params.country) {
          queryParams.country = params.country;
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

        // Always display all fields (including action statuses) to keep all data points accessible
        const summary = filtered.map((a, i) => {
          return `${i+1}. [Article ID: ${a.id}] "${a.title}"\n` +
                 `   - Source: ${a.source} | Country: ${a.region || 'Unknown'} | Ingested: ${a.created_at.slice(0, 10)}\n` +
                 `   - Sentiment: ${a.sentiment} | Impact Score: ${a.impact_score}/100\n` +
                 `   - Action Taken: ${a.action_taken ? 'YES' : 'NO'} | Action Note: "${a.action_note || 'None'}"\n` +
                 `   - URL: ${a.url}\n` +
                 `   - Snippet: "${a.snippet || 'No snippet content available'}"\n` +
                 `   - AI Rationale: "${a.ai_rationale || 'No rationale available'}"`;
        }).join('\n\n');

        return `VERIFIED DATABASE RESULTS (${filtered.length} articles). Present these EXACTLY as shown — do not modify titles, scores, or action notes:\n\n${summary}`;
      } catch (err) {
        return `Failed to execute query: ${err.message}. Parameters were: ${JSON.stringify(params)}`;
      }
    }
  });
}

// Tool 3: Get breakdown of news coverage by country/region of origin
function buildCoverageByCountryTool() {
  return new DynamicStructuredTool({
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
}

// Tool 4: Tavily Web Search (external sources)
function buildWebSearchTool() {
  if (!process.env.TAVILY_API_KEY) return null;

  return new DynamicStructuredTool({
    name: "tavily_search_results",
    description:
      "Search the live public web for news about Bangladesh economics and investments. " +
      "IMPORTANT: Use this tool ONLY as a last resort when: " +
      "(1) The internal database returned zero matching articles, or " +
      "(2) The user explicitly asks for live web search or external internet sources.",
    schema: z.object({
      query: z.string().describe("The clean search query to run on the web")
    }),
    func: async ({ query }) => {
      try {
        console.log(`[Tavily Search] Querying: "${query}"`);
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: query,
            search_depth: "basic",
            max_results: 3
          })
        });

        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(`API returned status ${response.status}: ${errorMsg}`);
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
          return `No web search results found for query: "${query}"`;
        }

        console.log(`[Tavily Search] Successfully retrieved ${data.results.length} results.`);
        const formatted = data.results.map((r, i) => {
          return `External Result ${i+1}:\n` +
                 `  Title: ${r.title}\n` +
                 `  URL: ${r.url}\n` +
                 `  Snippet: ${r.content}\n`;
        }).join("\n");

        return `EXTERNAL WEB RESULTS for "${query}" (not from BIDA database).\n` +
               `You MUST label these as "⚠️ External Source" and copy each URL exactly as shown — do NOT modify, shorten, or fabricate any URL:\n\n${formatted}`;
      } catch (err) {
        console.error("[Tavily Search Tool Error]:", err.message);
        return `Error running web search: ${err.message}`;
      }
    }
  });
}

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------
function buildSystemPrompt(hasWebSearch) {
  const basePrompt =
    "You are the official BIDA Macro-Intelligence Chat Agent. " +
    "You assist public officials in analyzing the Bangladesh investment climate, " +
    "national sentiment index, and international press coverage.\n\n" +

    "CRITICAL OUTPUT RULES:\n" +
    "1. NEVER output your reasoning, planning, tool-selection logic, or intermediate steps. " +
    "Start your response directly with the final answer/analysis. " +
    "Phrases like 'To answer this...', 'Let me query...', 'I will use the following tool...' are STRICTLY FORBIDDEN.\n" +
    "2. Keep responses concise — maximum 3-4 short paragraphs or a compact bullet list. Do not write lengthy essays.\n" +
    "3. Use markdown formatting (bold, bullet lists, tables) for readability.\n\n" +

    "DATA FIDELITY & ZERO HALLUCINATION RULES (CRITICAL):\n" +
    "1. You have access to every data point in the news_articles database through query_investment_database. " +
    "Analyze all returned articles regardless of their impact score. Do NOT filter out or ignore articles just because they have a low impact score.\n" +
    "2. Present the returned database values (titles, sources, sentiments, impact scores, actions taken) EXACTLY as they are given by the tool. " +
    "Do NOT paraphrase titles or alter any metrics.\n" +
    "3. NEVER fabricate articles, quotes, or statistics. If no news matches, state it clearly.\n" +
    "4. URL LINK SANITY: Every URL in your output MUST be a exact, character-for-character copy of a 'URL:' value returned inside the tool responses. " +
    "If a URL returned by the web search tool is truncated (ends with '...') or incomplete, do NOT output a link. Instead, output the website domain name as plain text (e.g., phnompenhpost.com) without any hyperlink. Never try to guess, complete, or reconstruct truncated URLs.\n\n" +

    "DATABASE SCHEMA CONTEXT:\n" +
    "- Column region stores the specific country of origin (e.g. 'Cambodia', 'Sweden').\n" +
    "- Column sentiment values are: 'opportunity', 'risk', 'regulation'. There is no 'neutral' category.\n\n" +

    "QUERY TRANSFORMATION RULES:\n" +
    "- Map 'positive', 'opportunities', 'growth' → sentiment='opportunity'.\n" +
    "- Map 'negative', 'risks', 'threats', 'danger' → sentiment='risk'.\n" +
    "- Map 'rules', 'policies', 'taxes', 'tariffs' → sentiment='regulation'.\n" +
    "- Map 'domestic', 'local', 'internal' → region='local'.\n" +
    "- Map 'foreign', 'international', 'global' → region='global'.\n" +
    "- Extract single-noun keywords for the 'search' field.\n" +
    "- By default, search the 60-day archive (include_archived=true). Set include_archived=false only if user specifies 'last week' or '7 days'.\n\n";

  const webSearchPrompt = hasWebSearch
    ? "TOOL PRIORITY (follow strictly):\n" +
      "1. ALWAYS call query_investment_database FIRST.\n" +
      "2. ONLY use tavily_search_results if: the database query returned zero articles, OR the user explicitly requests web/external sources.\n" +
      "3. Label all Tavily results with '⚠️ External Source (not in BIDA database):'.\n" +
      "4. Copy URLs exactly. NEVER fabricate, shorten, or modify URLs. If truncated, output as plain text.\n" +
      "5. Separate internal and external results with clear section headers.\n\n"
    : "WEB SEARCH STATUS: DISABLED.\n" +
      "You do NOT have access to web search. If asked, respond: 'Web search is not currently enabled. I can only search our internal verified database.'\n" +
      "Do NOT fabricate web results.\n\n";

  const analysisPrompt =
    "ANALYSIS INSTRUCTIONS:\n" +
    "- Consider all returned articles regardless of score, but highlight high-impact ones (>= 70) when summarizing trends.\n" +
    "- Compute math (averages, ratios, counts) explicitly from tool data if requested.\n" +
    "- If asked about subjects outside Bangladesh's economy/investments, politely decline.";

  return basePrompt + webSearchPrompt + analysisPrompt;
}

// ---------------------------------------------------------------------------
// Main Agent Runner
// ---------------------------------------------------------------------------
async function runAgent(userMessage) {
  const llm = buildLLM();

  // Build tools
  const tools = [
    buildClimateScoreTool(),
    buildQueryDatabaseTool(),
    buildCoverageByCountryTool(),
  ];

  const webSearchTool = buildWebSearchTool();
  if (webSearchTool) tools.push(webSearchTool);

  // Build prompt
  const systemPrompt = buildSystemPrompt(!!webSearchTool);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // Build agent
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: process.env.NODE_ENV !== 'production',
  });

  // Invoke
  const result = await executor.invoke({
    input: userMessage,
  });

  return result.output;
}

module.exports = { runAgent };
