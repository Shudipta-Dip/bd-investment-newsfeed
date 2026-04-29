This PRD is for **BD Investment Newsfeed** \- a high-stakes **Internal Intelligence & Reputation Management Dashboard** for the Bangladesh Government’s key investment promotion agencies (BIDA, BEZA, PPPA).

## ---

**Executive Summary**

**BD Investment Newsfeed** is an internal strategic intelligence platform designed to provide real-time visibility into how the global media perceives Bangladesh’s investment landscape. By aggregating data from international financial journals, policy papers, and social signals, it empowers officials at **BIDA, BEZA, and PPPA** to move from reactive to proactive communication.

The core problem is the **"Narrative Lag."** Negative or inaccurate international reporting on Bangladesh often goes unnoticed by local agencies for days, hindering timely corrections. Conversely, positive "buzz" is often not capitalized upon for investment promotion. This tool provides a unified "Command Center" for global sentiment.

**Key Differentiator:** Unlike general media monitoring, this is a **domain-specific intelligence engine** that uses AI-driven filtering to isolate high-impact FDI news, providing agencies with a "Heat Map" of global investor sentiment.

## ---

**Current Situation**

* **Current Actions:** PR teams at BIDA or BEZA manually scan major outlets (Reuters, Bloomberg) or rely on news clippings services that focus primarily on local (Bangladeshi) media.  
* **Current Challenges:** Local agencies are often "the last to know" when a niche international trade journal publishes a critique of Bangladesh’s infrastructure or tax policy.  
* **Existing Solutions:** Manual Google searches, WhatsApp groups for sharing links, and sporadic reports from foreign embassies. These are unorganized, unarchived, and lack data-driven insights.

## ---

**Problem Statement**

* **Fragmented Intelligence:** There is no single source of truth for "What the world is saying about us today."  
* **Missing Actionability:** Raw news links don't explain *why* a story matters or *what* the agency should do (e.g., issue a clarification, reach out to the journalist).  
* **Inefficiency:** High-ranking officials waste time reading duplicate stories or irrelevant local fluff instead of high-level international critiques.  
* **Reputational Risk:** Misinformation in global media can deter millions in potential FDI before a local agency even has a chance to respond.

## ---

**Competitive Analysis (Internal Tool Focus)**

| Competitor | Approach | Limitations for Gov | Differentiation "Moat" (The "Uncatchable" Strategy) |
| :---- | :---- | :---- | :---- |
| **Meltwater / Brandwatch** | Enterprise Social Listening. | High cost ($10k+); broad focus; lacks specific BD context. | **1\. FDI-Specific Logic:** Trained specifically to identify "Investment Barriers" vs. general news. **2\. Zero-Cloud Footprint:** Can be hosted on gov servers via the JSON flat-file approach for data sovereignty. **3\. Direct Agency Integration:** Features a "Draft Response" button tailored for BIDA/BEZA workflows. |
| **Google News (Finance)** | Automated news aggregation. | No sentiment analysis; full of ads/noise; no internal archiving. | **1\. Source Quality Score:** We prioritize "Institutional Grade" (IMF, ADB) over clickbait. **2\. The "Buzz" Indicator:** A custom algorithm that flags if a story is gaining traction in investor circles. **3\. White-Labeling:** Built for government eyes only—no tracking or external data leaks. |
| **BIDA Internal PR Team** | Manual clipping/Daily Email. | Human error; slow; limited to known sources. | **1\. 24/7 Scraping:** Operates across all time zones (London, NY, Tokyo) simultaneously. **2\. Crawl4AI Deep-Link:** Scrapes content behind non-paywalled technical hurdles where humans might skip. **3\. Narrative Tracking:** Shows how a single story evolves over 60 days. |
| **Feedly (Pro)** | Organized RSS feeds. | Requires manual curation; no collaborative "Action" tagging. | **1\. Actionable Tags:** Internal "Urgent: Correction Needed" or "Capitalize: Social Share" tags. **2\. Agency-Cross-Talk:** Allows BIDA and BEZA to see what news the other is looking at. **3\. Automated Briefings:** Generates a 1-page daily brief for the Executive Chairman via AI. |
| **Factiva (Dow Jones)** | Deep archive of global business news. | Extremely expensive; complex UI; not mobile-friendly for busy officials. | **1\. "Vibecoded" Speed:** Ultra-fast Next.js UI for officials on the move. **2\. Push Alerts:** Critical negative news triggers an instant Telegram/Signal alert to the comms head. **3\. Local Context Mapping:** Maps global news to specific local projects (e.g., Matarbari, Payra). |

## ---

**Solution Overview**

### **Core Functionality (V0/MVP)**

* **International Node Aggregator:** Python scraper targeting the "Big Five" (Reuters, FT, WSJ, Bloomberg, Nikkei) plus specialized trade journals (e.g., *Infrastructure Investor*).  
* **The "Buzz" Dashboard:** A clean, grid-based UI showing headlines, source, and a "Narrative Impact" score.  
* **Internal Actions:** A "Log Action" button where users can note if a response was sent.

### **Future Roadmap**

* **V1:** AI-Generated Summary (One paragraph summarizing the day's global sentiment).  
* **V2:** Narrative Heat Map (Visualizing which countries—e.g., USA, China, India—are talking most about BD FDI).  
* **V3:** Direct Journalist Database (Matching news stories to the journalist’s contact info for rapid PR outreach).

## ---

## 

## **Target Audience**

* **Primary:** Executive Chairmen and Directors of BIDA, BEZA, PPPA (Decision-makers).  
* **Secondary:** Public Relations & Communication Officers (The "Action-takers").  
* **Tertiary:** Ministry of Foreign Affairs (MoFA) economic wing (Strategic observers).

## ---

**Success Metrics**

* **Time to Awareness:** Reduction in time from "Article Published" to "Agency Informed."  
* **Response Rate:** Percentage of negative narratives addressed within 24 hours.  
* **Information Density:** Number of international-source articles processed vs. local duplicates.  
* **User Adoption:** Daily login rates by high-level officials.

## ---

**Design System (The "Gov-Tech" Edition)**

### **Visual Identity**

* **Primary Color:** Copper Green (\#527F76) \- Authority.  
* **Secondary Color:** Bangladesh National Red (\#F42A41) \- Used sparingly for **Critical/Negative News alerts**.  
* **Neutral Palette:** Modern Slates and Greys (\#1E293B) \- For a professional, non-distracting work environment.

### **UI Component Library**

* **Alert Banners:** High-visibility banners for "High Impact" news.  
* **Sentiment Badges:** \* **Green:** Growth/Positive.  
  * **Red:** Crisis/Negative.  
  * **Yellow:** Policy Change/Neutral.  
* **Action Drawer:** A side-panel that opens when a news item is clicked, allowing officers to assign tasks or draft responses.

### **Accessibility & Security**

* **Security:** Multi-Factor Authentication (MFA) via government email.  
* **Accessibility:** High-contrast mode for officials reading on tablets in low-light (e.g., in cars/planes).

### ---

### 

### **Risks & Mitigations**

* **Risk:** Data Sovereignty (Storing gov intelligence on external servers).  
* **Mitigation:** The flat-file (news.json) approach allows for easy migration to local on-premise servers if needed.

* **Risk:** Source Blocking (International sites blocking the scraper).  
* **Mitigation:** Use of rotating proxies and **Crawl4AI**'s advanced stealth features to mimic organic browsing.