const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const models = require('../models');
const { generateExecutiveSummary } = require('./aiValidator');

// ---------------------------------------------------------------------------
// Native Tool Declarations (Schemas for Gemini and Groq)
// ---------------------------------------------------------------------------

// 1. Gemini tools format (Google Generative AI FunctionDeclarations)
const geminiTools = [
  {
    functionDeclarations: [
      {
        name: "get_current_climate_score",
        description: "Get the current Bangladesh investment climate index score (0-100) and the accompanying AI narrative summary.",
        parameters: {
          type: "OBJECT",
          properties: {},
        }
      },
      {
        name: "query_investment_database",
        description: "Query the BIDA internal database of scraped investment articles using specific filters. By default, this searches the 60-day archive to make sure all news are fetched.",
        parameters: {
          type: "OBJECT",
          properties: {
            sentiment: { type: "STRING", description: "Filter by sentiment category ('opportunity', 'risk', 'regulation'). Omit or leave empty if not filtering." },
            search: { type: "STRING", description: "Keyword search query term" },
            region: { type: "STRING", description: "Filter by region category ('local', 'global'). Omit or leave empty if not filtering." },
            country: { type: "STRING", description: "Filter by specific country/region name (e.g. 'Cambodia', 'Sweden', 'New Zealand', 'United States')" },
            min_impact: { type: "STRING", description: "Filter by minimum impact score (0-100) or empty string" },
            max_impact: { type: "STRING", description: "Filter by maximum impact score (0-100) or empty string" },
            limit: { type: "STRING", description: "Max number of articles to return (default '20', max '50')" },
            include_archived: { type: "STRING", description: "Set to 'true' to search 60 days, 'false' for 7 days (default 'true')" }
          }
        }
      },
      {
        name: "get_coverage_by_country",
        description: "Get a statistical breakdown of which countries or regions are publishing investment news in our database.",
        parameters: {
          type: "OBJECT",
          properties: {
            include_archived: { type: "BOOLEAN", description: "Set to true to search the 60-day historical archive instead of the default 7-day dashboard window" }
          }
        }
      },
      {
        name: "get_database_stats",
        description: "Get quick summary counts of all active articles currently in the database (total, opportunities, risks, regulations) for the last 7 days.",
        parameters: {
          type: "OBJECT",
          properties: {},
        }
      },
      ...(process.env.TAVILY_API_KEY ? [{
        name: "tavily_search_results",
        description: "Search the live public web for news about Bangladesh economics and investments. Use ONLY as a last resort when database returns 0 articles or user asks for external/web search.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "The clean search query to run on the web" }
          },
          required: ["query"]
        }
      }] : [])
    ]
  }
];

// 2. Groq tools format (Chat Completion Tools)
const groqTools = [
  {
    type: "function",
    function: {
      name: "get_current_climate_score",
      description: "Get the current Bangladesh investment climate index score (0-100) and the accompanying AI narrative summary.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "query_investment_database",
      description: "Query the BIDA internal database of scraped investment articles using specific filters. By default, this searches the 60-day archive to make sure all news are fetched.",
      parameters: {
        type: "object",
        properties: {
          sentiment: { type: "string", description: "Filter by sentiment category ('opportunity', 'risk', 'regulation'). Omit or leave empty if not filtering." },
          search: { type: "string", description: "Keyword search query term" },
          region: { type: "string", description: "Filter by region category ('local', 'global'). Omit or leave empty if not filtering." },
          country: { type: "string", description: "Filter by specific country/region name (e.g. 'Cambodia', 'Sweden', 'New Zealand', 'United States')" },
          min_impact: { type: "string", description: "Filter by minimum impact score (0-100) or empty string" },
          max_impact: { type: "string", description: "Filter by maximum impact score (0-100) or empty string" },
          limit: { type: "string", description: "Max number of articles to return (default '20', max '50')" },
          include_archived: { type: "string", description: "Set to 'true' to search 60 days, 'false' for 7 days (default 'true')" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_coverage_by_country",
      description: "Get a statistical breakdown of which countries or regions are publishing investment news in our database.",
      parameters: {
        type: "object",
        properties: {
          include_archived: { type: "boolean", description: "Set to true to search the 60-day historical archive instead of the default 7-day dashboard window" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_database_stats",
      description: "Get quick summary counts of all active articles currently in the database (total, opportunities, risks, regulations) for the last 7 days.",
      parameters: { type: "object", properties: {} }
    }
  },
  ...(process.env.TAVILY_API_KEY ? [{
    type: "function",
    function: {
      name: "tavily_search_results",
      description: "Search the live public web for news about Bangladesh economics and investments. Use ONLY as a last resort when database returns 0 articles or user asks for external/web search.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The clean search query to run on the web" }
        },
        required: ["query"]
      }
    }
  }] : [])
];

// ---------------------------------------------------------------------------
// Tool Execution Engine
// ---------------------------------------------------------------------------
async function executeTool(name, args) {
  switch (name) {
    case "get_current_climate_score": {
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
    case "query_investment_database": {
      try {
        let limit = 20;
        if (args.limit) {
          const parsedLimit = parseInt(args.limit, 10);
          if (!isNaN(parsedLimit)) limit = Math.min(parsedLimit, 50);
        }
        
        const searchArchive = args.include_archived === true || args.include_archived === "true" || args.include_archived === undefined || args.include_archived === "";

        const queryParams = {
          limit: limit,
          daysLimit: searchArchive ? 60 : 7,
        };

        if (args.sentiment && args.sentiment !== "") {
          const sentVal = args.sentiment.toLowerCase();
          if (["opportunity", "risk", "regulation"].includes(sentVal)) {
            queryParams.sentiment = sentVal;
          }
        }
        if (args.search && args.search !== "") queryParams.search = args.search;
        if (args.country && args.country !== "") {
          queryParams.country = args.country;
          // Ignore region if a specific country is requested to prevent conflicting filters (e.g. region='local' and country='Cambodia')
        } else if (args.region && args.region !== "") {
          const regVal = args.region.toLowerCase();
          if (["local", "global"].includes(regVal)) {
            queryParams.region = regVal;
          }
        }

        const { data: articles, error } = await models.getArticles(queryParams);
        if (error) return `Error fetching articles: ${error}`;
        if (!articles || articles.length === 0) {
          return `No articles found matching filters: ${JSON.stringify(args)}`;
        }

        let filtered = articles;
        if (args.min_impact && args.min_impact !== "") {
          const minImpact = parseFloat(args.min_impact);
          if (!isNaN(minImpact)) {
            filtered = filtered.filter(a => (a.impact_score || 0) >= minImpact);
          }
        }
        if (args.max_impact && args.max_impact !== "") {
          const maxImpact = parseFloat(args.max_impact);
          if (!isNaN(maxImpact)) {
            filtered = filtered.filter(a => (a.impact_score || 0) <= maxImpact);
          }
        }

        if (filtered.length === 0) {
          return `Articles found in DB, but none matched impact range limits: min_impact=${args.min_impact}, max_impact=${args.max_impact}`;
        }

        const summary = filtered.map((a, i) => {
          return `${i+1}. [Article ID: ${a.id}] "${a.title}"\n` +
                 `   - Source: ${a.source} | Country: ${a.region || 'Unknown'} | Ingested: ${a.created_at.slice(0, 10)}\n` +
                 `   - Sentiment: ${a.sentiment} | Impact Score: ${a.impact_score}/100\n` +
                 `   - URL: ${a.url}\n` +
                 `   - Snippet: "${a.snippet || 'No snippet content available'}"\n` +
                 `   - AI Rationale: "${a.ai_rationale || 'No rationale available'}"`;
        }).join('\n\n');

        return `[FACTUAL DATABASE RESULTS - COPY VERBATIM - DO NOT PARAPHRASE OR INVENT]\n` +
               `Found ${filtered.length} matching articles in the database:\n\n${summary}`;
      } catch (err) {
        return `Failed to execute query: ${err.message}. Parameters were: ${JSON.stringify(args)}`;
      }
    }
    case "get_coverage_by_country": {
      try {
        const daysLimit = args.include_archived ? 60 : 7;
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
        return `Error compiling country coverage stats: ${err.message}. Parameters were: ${JSON.stringify(args)}`;
      }
    }
    case "get_database_stats": {
      try {
        const { data, error } = await models.getStats();
        if (error) return `Error fetching stats: ${error}`;
        return `Database Stats (last 7 days):\n` +
               ` - Total Articles: ${data.total}\n` +
               ` - Opportunities: ${data.opportunity}\n` +
               ` - Risks: ${data.risk}\n` +
               ` - Regulations: ${data.regulation}`;
      } catch (err) {
        return `Error fetching stats: ${err.message}`;
      }
    }
    case "tavily_search_results": {
      try {
        console.log(`[Tavily Search] Querying: "${args.query}"`);
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: args.query,
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
          return `No web search results found for query: "${args.query}"`;
        }

        const formatted = data.results.map((r, i) => {
          return `External Result ${i+1}:\n` +
                 `  Title: ${r.title}\n` +
                 `  URL: ${r.url}\n` +
                 `  Snippet: ${r.content}\n`;
        }).join("\n");

        return `EXTERNAL WEB RESULTS for "${args.query}" (not from BIDA database).\n` +
               `You MUST label these as "⚠️ External Source" and copy each URL exactly as shown — do NOT modify, shorten, or fabricate any URL:\n\n${formatted}`;
      } catch (err) {
        return `Error running web search: ${err.message}`;
      }
    }
    default:
      return `Unknown tool name: ${name}`;
  }
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
function buildSystemPrompt(hasWebSearch) {
  const basePrompt =
    "You are the official BIDA Macro-Intelligence Chat Agent. " +
    "You assist public officials in analyzing the Bangladesh investment climate, " +
    "national sentiment index, and international press coverage.\n\n" +

    "CRITICAL OUTPUT RULES:\n" +
    "1. You are allowed to output planning thoughts and reasoning steps internally. " +
    "However, your FINAL response to the user must contain ONLY the clean, final, synthesized analysis. " +
    "Avoid starting your final response with meta-commentary like 'Based on the tool results...' or 'I queried the database and found...'. " +
    "Present the information directly and cleanly.\n" +
    "2. FORMATTING: When presenting multiple articles, you MUST separate each article with a clear, readable horizontal line (---) or double paragraph break. " +
    "Do NOT bundle them in consecutive bullet points with the same indent level. Make the visual structure clean and easy to scan.\n" +
    "3. Keep final responses concise — maximum 3-4 short paragraphs or a cleanly spaced list. Do not write lengthy essays.\n" +
    "4. Use markdown formatting (bold, bullet lists, tables) for readability.\n\n" +

    "DATA FIDELITY & ZERO HALLUCINATION RULES (CRITICAL):\n" +
    "1. You have access to every data point in the news_articles database through query_investment_database (including Article ID, Country, Sentiment, Impact Score, URL, Snippet, and AI Rationale). " +
    "Analyze all returned articles regardless of their impact score. Do NOT filter out or ignore articles just because they have a low impact score.\n" +
    "2. Present the returned database values (titles, sources, sentiments, impact scores) EXACTLY as they are given by the tool. " +
    "Do NOT paraphrase titles or alter any metrics.\n" +
    "3. NEVER fabricate articles, quotes, or statistics. If no news matches, state it clearly.\n" +
    "4. URL LINK SANITY: Every URL in your output MUST be an exact, character-for-character copy of a 'URL:' value returned inside the tool responses. " +
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
    "- By default, search the 60-day archive (include_archived=true). Set include_archived=false only if user specifies 'last week' or '7 days'.\n" +
    "- MUTUALLY EXCLUSIVE FILTERS: If you specify the specific 'country' parameter (e.g. 'Cambodia'), you MUST NOT set the 'region' parameter, as they are mutually exclusive.\n\n";

  const webSearchPrompt = hasWebSearch
    ? "TOOL PRIORITY & PARALLEL EXECUTION:\n" +
      "1. ALWAYS call query_investment_database FIRST.\n" +
      "2. ONLY use tavily_search_results if: the database query returned zero articles, OR the user explicitly requests web/external sources.\n" +
      "3. If a request requires both internal and external data, trigger query_investment_database and tavily_search_results in parallel in a single turn to minimize latency.\n" +
      "4. Label all Tavily results with '⚠️ External Source (not in BIDA database):'.\n" +
      "5. Copy URLs exactly. NEVER fabricate, shorten, or modify URLs. If truncated, output as plain text.\n" +
      "6. Separate internal and external results with clear section headers.\n\n"
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
// Native ReAct Loop Executors
// ---------------------------------------------------------------------------

// 1. Native Gemini 2.0 Flash ReAct Loop
async function runGeminiAgent(userMessage, history) {
  const keys = [
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No Gemini API keys configured.");
  }

  let lastError = null;

  for (const apiKey of keys) {
    try {
      console.log(`[runGeminiAgent] Attempting Gemini run with key starting with: ${apiKey.slice(0, 8)}...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: buildSystemPrompt(!!process.env.TAVILY_API_KEY),
        tools: geminiTools,
      });

      const contents = [];
      if (history && Array.isArray(history)) {
        history.forEach(h => {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }

      contents.push({
        role: "user",
        parts: [{ text: userMessage }]
      });

      let loopCount = 0;
      const maxLoops = 5;

      while (loopCount < maxLoops) {
        loopCount++;
        console.log(`[Gemini Loop ${loopCount}] Querying Gemini API...`);

        const result = await model.generateContent({
          contents,
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1024,
          }
        });

        const response = result.response;
        const candidate = response.candidates?.[0];
        const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall);
        const textPart = candidate?.content?.parts?.find(p => p.text);

        if ((!functionCalls || functionCalls.length === 0) && textPart) {
          return textPart.text;
        }

        if ((!functionCalls || functionCalls.length === 0) && response.text) {
          return response.text();
        }

        contents.push({
          role: "model",
          parts: candidate?.content?.parts || []
        });

        console.log(`[Gemini Loop ${loopCount}] Invoking ${functionCalls.length} tool(s)...`);
        const functionResponses = await Promise.all(
          functionCalls.map(async (call) => {
            const { name, args } = call.functionCall;
            console.log(`[Gemini Tool Exec] Running ${name} with args:`, args);
            const output = await executeTool(name, args);
            return {
              functionResponse: {
                name,
                response: { result: output }
              }
            };
          })
        );

        contents.push({
          role: "function",
          parts: functionResponses
        });
      }

      throw new Error("Gemini agent exceeded maximum tool iteration loop limit.");
    } catch (err) {
      console.error(`[runGeminiAgent] Key starting with ${apiKey.slice(0, 8)} failed:`, err.message);
      lastError = err;
      // Key failed, proceed to loop and try next key in array
    }
  }

  throw lastError || new Error("All Gemini API keys failed.");
}

// 2. Native Groq (Llama 3.3 70B) ReAct Loop
async function runGroqAgent(userMessage, history) {
  const keys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No Groq API keys configured.");
  }

  const groq = new Groq({ apiKey: keys[0] });

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt(!!process.env.TAVILY_API_KEY)
    }
  ];

  if (history && Array.isArray(history)) {
    history.forEach(h => {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text
      });
    });
  }

  messages.push({
    role: "user",
    content: userMessage
  });

  let loopCount = 0;
  const maxLoops = 5;

  while (loopCount < maxLoops) {
    loopCount++;
    console.log(`[Groq Loop ${loopCount}] Querying Groq API...`);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: groqTools,
      tool_choice: "auto",
      temperature: 0,
      max_tokens: 1024,
    });

    const choice = response.choices?.[0];
    const message = choice?.message;
    const toolCalls = message?.tool_calls;

    // If no tool calls, return final response
    if (!toolCalls || toolCalls.length === 0) {
      return message?.content || "";
    }

    // Append model response containing tool calls to history
    messages.push(message);

    // Execute tool calls in parallel
    console.log(`[Groq Loop ${loopCount}] Invoking ${toolCalls.length} tool(s)...`);
    const toolResponses = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const { id, function: fn } = toolCall;
        const name = fn.name;
        let args = {};
        try {
          args = JSON.parse(fn.arguments);
        } catch (_) {}

        console.log(`[Groq Tool Exec] Running ${name} with args:`, args);
        const output = await executeTool(name, args);

        return {
          role: "tool",
          tool_call_id: id,
          name: name,
          content: output
        };
      })
    );

    // Append all tool responses to messages history
    messages.push(...toolResponses);
  }

  throw new Error("Groq agent exceeded maximum tool iteration loop limit.");
}

// ---------------------------------------------------------------------------
// Main Integrated Agent Runner (Primary Gemini, Fallback Groq)
// ---------------------------------------------------------------------------
async function runAgent(userMessage, history) {
  let geminiErr = null;
  if (process.env.GEMINI_API_KEY_4) {
    try {
      console.log("[runAgent] Initializing Gemini primary agent...");
      return await runGeminiAgent(userMessage, history);
    } catch (geminiError) {
      console.error("[runAgent] Gemini primary agent failed. Falling back to Groq...", geminiError.message);
      geminiErr = geminiError;
    }
  }

  try {
    console.log("[runAgent] Initializing Groq agent...");
    return await runGroqAgent(userMessage, history);
  } catch (groqError) {
    console.error("[runAgent] Groq agent failed too:", groqError.message);
    if (geminiErr) {
      throw new Error(`Gemini Error: ${geminiErr.message} | Groq Error: ${groqError.message}`);
    }
    throw groqError;
  }
}

module.exports = { runAgent };
