This design system is tailored for the **BD Investment Newsfeed**, a high-stakes **Internal Intelligence Command Center**. It balances the authoritative nature of government agencies (BIDA, BEZA, PPPA) with the "Vibecoded" speed of a modern SaaS tool.

## ---

**Part 1: Design System Documentation**

### **1\. Typography**

We use a dual-font system to separate editorial content from raw data and metrics.

* **Primary Sans (UI & Headings):** Elma Sans. Utilitarian geometric sans-serif for quick scanning of international headlines.  
* **Data Mono (Metrics & Sources):** JetBrains Mono. Used for "Narrative Impact" scores and technical source metadata.

| Element | Font Weight | Size | Line Height |
| :---- | :---- | :---- | :---- |
| **H1 (Dashboard Title)** | Bold (700) | 30px / 1.875rem | 1.2 |
| **H2 (Section Header)** | Semi-bold (600) | 24px / 1.5rem | 1.3 |
| **H3 (Card Title)** | Medium (500) | 18px / 1.125rem | 1.4 |
| **Body (News Snippet)** | Regular (400) | 16px / 1rem | 1.6 |
| **Caption (Metadata)** | Mono Regular | 12px / 0.75rem | 1.0 |

### **2\. Color Palette**

Based on the "Gov-Tech" requirements, the palette uses **Copper Green** for authority and **National Red** for urgency.

* **Primary (Copper Green):** \#527F76 (Tailwind: primary)

* **Destructive (National Red):** \#F42A41 (Tailwind: destructive)

* **Neutral Palette (Modern Slates):**

  * Background: \#F8FAFC (Slate 50\)  
  * Foreground: \#0F172A (Slate 900\)  
  * Muted: \#64748B (Slate 500\)  
* **Sentiment States:**

  * Positive (Green): \#10B981 (Emerald 500\)  
  * Negative (Red): \#F42A41 (National Red)  
  * Neutral (Yellow): \#F59E0B (Amber 500\)

### **3\. Spacing, Layout & Shadows**

* **Scale:** 8pt grid system (2px, 4px, 8px, 16px, 24px, 32px, 48px, 64px).  
* **Container:** Max-width 1440px for desktop dashboards.  
* **Radius:** 0.5rem (8px) for cards and inputs to maintain a professional, slightly rounded aesthetic.  
* **Shadows:**  
  * sm: 0 1px 2px 0 rgb(0 0 0 / 0.05) (Standard cards).  
  * md: 0 4px 6px \-1px rgb(0 0 0 / 0.1) (Hover states/Action Drawer).

### **4\. Icons (Lucide)**

* **Stroke Width:** 2px for clarity.  
* **Standard Size:** 18px for inline text, 24px for navigation.  
* **Key Icons:** TrendingUp (Buzz), AlertOctagon (Negative Narrative), FileText (Policy Papers), Globe (Global Media).

### **5\. Component Guidelines (shadcn/ui Customization)**

* **Button:** Rounded md, bold text. Primary uses Copper Green; Destructive uses National Red.  
* **Badge:** Small, uppercase, mono font. Colors dictated by the Sentiment State (Green/Red/Yellow) .

* **Input:** Slate-200 border, shifts to Copper Green on focus. High-contrast placeholder text for field usability.  
* **Alert Banner:** Full-width, high-visibility banners with a left-accent border (4px) in National Red for "Critical" news.

## ---

**Part 2: Test Website Layout (Preview)**

Below is the conceptual layout of the **Intelligence Dashboard** illustrating the design system.

HTML

\<div class\="min-h-screen bg-slate-50 font-sans text-slate-900"\>  
  \<div class\="bg-red-50 border-l-4 border-\[\#F42A41\] p-4 flex items-center justify-between"\>  
    \<div class\="flex items-center gap-3"\>  
      \<lucide-alert-octagon class\="text-\[\#F42A41\] w-5 h-5" /\>  
      \<p class\="text-sm font-medium text-red-900"\>CRITICAL: Negative narrative detected in Financial Times regarding Tax Policy.\</p\>  
    \</div\>  
    \<button class\="text-xs font-bold uppercase tracking-wider text-\[\#F42A41\]"\>View Impact\</button\>  
  \</div\>

  \<header class\="border-b bg-white px-8 py-4 flex justify-between items-center"\>  
    \<div class\="flex items-center gap-2"\>  
      \<div class\="w-8 h-8 bg-\[\#527F76\] rounded-md flex items-center justify-center text-white font-bold"\>BD\</div\>  
      \<h1 class\="text-xl font-bold tracking-tight"\>Intelligence Command\</h1\>  
    \</div\>  
    \<div class\="flex items-center gap-4"\>  
      \<input type\="text" placeholder\="Search global buzz..." class\="px-4 py-2 border border-slate-200 rounded-md text-sm w-64 focus:ring-2 focus:ring-\[\#527F76\] outline-none" /\>  
      \<div class\="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm"\>\</div\>  
    \</div\>  
  \</header\>

  \<main class\="max-w-7xl mx-auto p-8"\>  
    \<section class\="mb-12"\>  
      \<h2 class\="text-3xl font-bold mb-2"\>Global Sentiment Overview\</h2\>  
      \<p class\="text-slate-500 max-w-2xl"\>Daily AI Summary: Today's global buzz is 74% positive, primarily driven by infrastructure progress at Matarbari. 3 negative narratives require immediate attention.\</p\>  
        
      \<div class\="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"\>  
        \<div class\="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"\>  
          \<p class\="text-xs font-mono text-slate-500 uppercase"\>Narrative Impact\</p\>  
          \<p class\="text-4xl font-bold text-\[\#527F76\]"\>High\</p\>  
          \<div class\="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden"\>  
            \<div class\="h-full bg-\[\#527F76\] w-\[85%\]"\>\</div\>  
          \</div\>  
        \</div\>  
        \<div class\="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"\>  
          \<p class\="text-xs font-mono text-slate-500 uppercase"\>Response Rate\</p\>  
          \<p class\="text-4xl font-bold"\>92%\</p\>  
          \<p class\="text-xs text-emerald-600 mt-2"\>↑ 4% from yesterday\</p\>  
        \</div\>  
        \<div class\="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"\>  
          \<p class\="text-xs font-mono text-slate-500 uppercase"\>Global Sources\</p\>  
          \<p class\="text-4xl font-bold"\>142\</p\>  
          \<p class\="text-xs text-slate-400 mt-2 font-mono"\>Reuters, Bloomberg \+140\</p\>  
        \</div\>  
      \</div\>  
    \</section\>

    \<section\>  
      \<div class\="flex justify-between items-end mb-6"\>  
        \<h3 class\="text-xl font-semibold"\>Concurrent Buzz\</h3\>  
        \<div class\="flex gap-2"\>  
          \<button class\="px-4 py-2 bg-\[\#527F76\] text-white text-sm font-semibold rounded-md hover:bg-\[\#3f635c\] transition-colors"\>Export Report\</button\>  
          \<button class\="px-4 py-2 bg-white border border-slate-200 text-sm font-semibold rounded-md hover:bg-slate-50"\>Filter\</button\>  
        \</div\>  
      \</div\>

      \<div class\="grid grid-cols-1 md:grid-cols-2 gap-6"\>  
        \<div class\="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"\>  
          \<div class\="flex justify-between items-start mb-4"\>  
            \<span class\="px-2 py-1 bg-red-100 text-\[\#F42A41\] text-\[10px\] font-mono font-bold rounded"\>CRITICAL\</span\>  
            \<span class\="text-\[10px\] font-mono text-slate-400"\>2H AGO • REUTERS\</span\>  
          \</div\>  
          \<h4 class\="text-lg font-bold leading-snug mb-3 group-hover:text-\[\#527F76\] transition-colors"\>Analysts warn of potential "Red Tape" delays in new Special Economic Zones.\</h4\>  
          \<p class\="text-sm text-slate-600 mb-6"\>A deep-dive report suggests bureaucratic hurdles might deter Japanese investors in the BEZA regions...\</p\>  
          \<div class\="flex items-center gap-3"\>  
            \<button class\="px-3 py-1.5 bg-\[\#F42A41\] text-white text-xs font-bold rounded"\>LOG ACTION\</button\>  
            \<button class\="px-3 py-1.5 text-slate-500 text-xs font-bold border rounded"\>DISMISS\</button\>  
          \</div\>  
        \</div\>

        \<div class\="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"\>  
          \<div class\="flex justify-between items-start mb-4"\>  
            \<span class\="px-2 py-1 bg-emerald-100 text-emerald-700 text-\[10px\] font-mono font-bold rounded"\>GROWTH\</span\>  
            \<span class\="text-\[10px\] font-mono text-slate-400"\>5H AGO • NIKKEI ASIA\</span\>  
          \</div\>  
          \<h4 class\="text-lg font-bold leading-snug mb-3 group-hover:text-\[\#527F76\] transition-colors"\>Bangladesh Infrastructure Boom: A New Hub for Regional Connectivity.\</h4\>  
          \<p class\="text-sm text-slate-600 mb-6"\>Nikkei highlights the Matarbari deep-sea port as a game-changer for the Bay of Bengal investment corridor...\</p\>  
          \<div class\="flex items-center gap-3"\>  
            \<button class\="px-3 py-1.5 bg-\[\#527F76\] text-white text-xs font-bold rounded"\>SHARE SIGNAL\</button\>  
            \<button class\="px-3 py-1.5 text-slate-500 text-xs font-bold border rounded"\>ARCHIVE\</button\>  
          \</div\>  
        \</div\>  
      \</div\>  
    \</section\>  
  \</main\>  
\</div\>  
