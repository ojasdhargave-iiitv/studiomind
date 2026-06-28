// StudioMind Frontend API Client with Local Mock Capability
// Set USE_MOCK to false when backend server is ready to be tested!
const USE_MOCK = false;

const BASE = "/api"; // Using proxy path configured in vite.config.js

// --- Local Storage Mock Database Helpers ---
const getMockData = (key, defaultVal = []) => {
  if (typeof window === "undefined") return defaultVal;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const saveMockData = (key, data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Seed mock memory database if empty
const seedMockDatabase = () => {
  const proj001MemoriesKey = "studiomind_memories_proj_001";
  if (!localStorage.getItem(proj001MemoriesKey)) {
    saveMockData(proj001MemoriesKey, [
      "User started Luminary App project.",
      "Aesthetic target: Calming meditation dark tracker."
    ]);
  }

  const proj002MemoriesKey = "studiomind_memories_proj_002";
  if (!localStorage.getItem(proj002MemoriesKey)) {
    saveMockData(proj002MemoriesKey, [
      "Project: Forge Design System.",
      "Aesthetic target: Structured SaaS design system."
    ]);
  }
};

// Initialize mock DB
if (typeof window !== "undefined") {
  seedMockDatabase();
}

// Helper to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Implementation ---

/**
 * Send a chat message. Returns { reply, recalled_memory }.
 */
export const sendMessage = async (message, project_id) => {
  if (USE_MOCK) {
    await delay(750); // Simulate network latency

    const memoriesKey = `studiomind_memories_${project_id}`;
    const chatsKey = `studiomind_chats_${project_id}`;
    
    const currentMemories = getMockData(memoriesKey, []);
    const currentChats = getMockData(chatsKey, []);

    // 1. Semantic query matching (Mocking Cognee recall)
    const lowerMessage = message.toLowerCase();
    let recalled = "";
    
    // Check what to recall
    if (lowerMessage.includes("preference") || lowerMessage.includes("remember") || lowerMessage.includes("what did we") || lowerMessage.includes("aesthetic")) {
      recalled = currentMemories.join("\n");
    } else {
      // Find matches based on keywords
      const matches = currentMemories.filter(m => {
        const words = m.toLowerCase().split(/\W+/);
        return words.some(w => w.length > 3 && lowerMessage.includes(w));
      });
      recalled = matches.slice(0, 3).join("\n");
    }

    // 2. Generate Intelligent Design partner reply (Mocking Claude LLM)
    let reply = "";
    if (lowerMessage.includes("dark") && lowerMessage.includes("minimal")) {
      reply = `I love the direction of a dark, minimal aesthetic. Let's think about typography and layout.
      
Since you want lots of breathing room, I recommend using a minimum page margin of 48px or even 64px, and a font-size hierarchy with large, clean headings (using 'Outfit' or 'Inter') paired with generous line-heights (1.6x).

For the color scheme, instead of pure black (#000), let's use a subtle off-black like \`#09090b\` or \`#0a0a0c\`. It feels warmer and more premium. We can pair it with a single accent color like electric indigo (\`#6366f1\`) for focal points.

What are your thoughts on using cards with ultra-subtle borders (\`1px solid rgba(255,255,255,0.05)\`) to organize content, or would you prefer a completely boundary-free layout?`;

      // Update mock memories with design preferences
      if (!currentMemories.some(m => m.includes("dark, minimal aesthetic"))) {
        currentMemories.push(`User wants a dark, minimal aesthetic for the project.`);
      }
      if (!currentMemories.some(m => m.includes("breathing room"))) {
        currentMemories.push(`Preferred typography: heavy headers, clean line heights, lots of breathing room.`);
      }
      if (!currentMemories.some(m => m.includes("electric indigo"))) {
        currentMemories.push(`Aesthetic choice: Obsidian backgrounds (#09090b) with a single electric indigo accent (#6366f1).`);
      }
    } 
    else if (lowerMessage.includes("remember") || lowerMessage.includes("preference")) {
      if (currentMemories.length > 0) {
        reply = `Here is what I remember about your design preferences for this project:

${currentMemories.map((m) => `• ${m}`).join("\n")}

Based on this, I'll ensure all layout and style advice aligns with these goals. Should we expand on the typography hierarchy or start mapping the color variables?`;
      } else {
        reply = "I don't have any design preferences saved in my memory for this project yet! Let's start by talking about the aesthetic goals or target audience.";
      }
    } 
    else if (lowerMessage.includes("font") || lowerMessage.includes("typography") || lowerMessage.includes("text")) {
      reply = `For typography in a clean design layout, I strongly recommend setting up a clean ratio. Let's use a **Major Third (1.250)** scale:
• Display Headings: \`3.052rem\` (bold, tracking \`-0.02em\`, 'Outfit')
• H1: \`2.441rem\`
• H2: \`1.953rem\`
• Body: \`1rem\` (light/regular Inter, line-height \`1.625\`)

To maintain that premium aesthetic, we should style labels with wide tracking (\`0.08em\`, uppercase, \`11px\`). Should we define the display font weights now?`;
      
      if (!currentMemories.some(m => m.includes("Major Third scale"))) {
        currentMemories.push(`Typography preference: Major Third scale using Outfit for headings and Inter for body text.`);
      }
    }
    else if (lowerMessage.includes("color") || lowerMessage.includes("palette") || lowerMessage.includes("theme")) {
      reply = `Let's define a premium dark color palette. Instead of raw high-contrast colors, we can build a cohesive theme:
• **Canvas Background**: \`#09090b\` (Obsidian dark)
• **Surfaces/Cards**: \`#18181b\` (zinc dark grey)
• **Borders**: \`rgba(255, 255, 255, 0.08)\`
• **Primary Text**: \`#f4f4f5\` (off-white)
• **Muted Text**: \`#71717a\`
• **Accent glow**: \`#6366f1\` (indigo) or \`#f59e0b\` (amber)

This gives us beautiful glassmorphism opportunities. What accent color calls out to you for key UI elements?`;
      
      if (!currentMemories.some(m => m.includes("Zinc dark grey surfaces"))) {
        currentMemories.push(`Color scheme choice: Zinc dark grey surfaces, obsidian canvas background, and thin borders.`);
      }
    }
    else {
      // General helpful response
      reply = `That is an interesting design concept. To elevate it further, we should focus on detail:
1. **Interactive Elements**: Use subtle transitions (\`0.2s cubic-bezier(0.4, 0, 0.2, 1)\`) for hovers.
2. **Visual Hierarchy**: Ensure strong contrast between headings and description copy.
3. **Purity**: Keep layouts uncluttered. Every element should have a structural purpose.

What specific screen or UI component are we designing right now? I'll reference our project preferences.`;
    }

    // 3. Save this exchange to memory & chats
    currentChats.push({ role: "user", content: message });
    currentChats.push({ role: "assistant", content: reply });
    
    saveMockData(memoriesKey, currentMemories);
    saveMockData(chatsKey, currentChats);

    return {
      reply,
      recalled_memory: recalled
    };
  }

  // Real API Fetch Logic
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, project_id })
  });
  if (!res.ok) {
    let errorDetail = "";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || "";
    } catch (_) {}
    throw new Error(errorDetail || `Chat failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Send thumbsup/thumbsdown feedback for a message.
 * type: "thumbsup" | "thumbsdown"
 * messageContent: the assistant message text
 */
export const sendFeedback = async (type, messageContent, project_id) => {
  if (USE_MOCK) {
    await delay(300);
    const feedbackKey = `studiomind_feedback_${project_id}`;
    const currentFeedback = getMockData(feedbackKey, []);
    currentFeedback.push({ type, content: messageContent, timestamp: new Date().toISOString() });
    saveMockData(feedbackKey, currentFeedback);

    // Cognee memory improvement simulation
    const memoriesKey = `studiomind_memories_${project_id}`;
    const currentMemories = getMockData(memoriesKey, []);
    if (type === "thumbsup") {
      currentMemories.push(`User approved design direction: "${messageContent.substring(0, 60)}..."`);
    } else {
      currentMemories.push(`User rejected design suggestion: "${messageContent.substring(0, 60)}..."`);
    }
    saveMockData(memoriesKey, currentMemories);

    return { status: "ok", message: "Memory updated locally" };
  }

  const res = await fetch(`${BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      feedback: `${type}: ${messageContent}`,
      project_id
    })
  });
  if (!res.ok) throw new Error(`Feedback failed: ${res.status}`);
  return res.json();
};

/**
 * Ingest a reference URL into a project's memory.
 */
export const ingestURL = async (url, project_id) => {
  if (USE_MOCK) {
    await delay(600);
    const urlsKey = `studiomind_urls_${project_id}`;
    const memoriesKey = `studiomind_memories_${project_id}`;
    
    const currentUrls = getMockData(urlsKey, []);
    currentUrls.push({ url, time: new Date().toLocaleTimeString() });
    saveMockData(urlsKey, currentUrls);

    // Extract domains for realistic mock memory
    let domain = "external site";
    try {
      domain = new URL(url).hostname;
    } catch (_) {}

    const currentMemories = getMockData(memoriesKey, []);
    currentMemories.push(`Ingested style reference from ${domain} (${url}). Visual profile includes high-contrast elements, responsive typography, and glowing interaction details.`);
    saveMockData(memoriesKey, currentMemories);

    return { status: "ok", message: `URL ingested into project ${project_id} (mocked)` };
  }

  const res = await fetch(`${BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, project_id })
  });
  if (!res.ok) throw new Error(`Ingest failed: ${res.status}`);
  return res.json();
};

/**
 * Fetch Style DNA for a user across all projects.
 * Returns { dna: string }
 */
export const getDNA = async (user_id) => {
  if (USE_MOCK) {
    await delay(500);

    // Traverses all memories across localStorage
    const keys = Object.keys(localStorage);
    const projectMemories = [];
    
    keys.forEach(key => {
      if (key.startsWith("studiomind_memories_")) {
        const memories = JSON.parse(localStorage.getItem(key)) || [];
        projectMemories.push(...memories);
      }
    });

    if (projectMemories.length === 0) {
      return { dna: "" };
    }

    // Synthesize mock DNA from the memories list
    const hasDarkMinimal = projectMemories.some(m => m.toLowerCase().includes("dark") || m.toLowerCase().includes("minimal"));
    const hasTypography = projectMemories.some(m => m.toLowerCase().includes("typography") || m.toLowerCase().includes("font"));
    const hasColors = projectMemories.some(m => m.toLowerCase().includes("color") || m.toLowerCase().includes("background") || m.toLowerCase().includes("border"));
    const hasIngested = projectMemories.some(m => m.toLowerCase().includes("ingested") || m.toLowerCase().includes("reference"));

    const dnaBlocks = [
      "Consistent Design Language: Prefers clean, structured layouts built on grids with visible margins (48px+).",
      "Canvas Treatment: Strong visual tendency towards sleek dark mode environments with solid obsidian backgrounds (#09090b) over pure black.",
      "Card Architecture: Repeated pattern of bounding containers with thin border lines (rgba(255,255,255,0.05)) and rounded corners (12px).",
    ];

    if (hasDarkMinimal) {
      dnaBlocks.push("Aesthetic Tone: Extremely minimal, opinionated details, high ratio of white/empty space, high premium index.");
    }
    if (hasTypography) {
      dnaBlocks.push("Typographic Print: Employs a clean scale structure (Outfit displaying titles, Inter displaying content) with wide character tracking.");
    }
    if (hasColors) {
      dnaBlocks.push("Chromatic Accents: Prefers neon colors for focus and interactions, especially electric indigo (#6366f1) and zinc surface greys.");
    }
    if (hasIngested) {
      dnaBlocks.push("Inspirational Triggers: Style influenced by grid alignments and glassmorphism elements gathered from ingested Behance/Dribbble boards.");
    }

    return { dna: dnaBlocks.join("\n") };
  }

  const res = await fetch(`${BASE}/dna?user_id=${user_id}`);
  if (!res.ok) throw new Error(`DNA fetch failed: ${res.status}`);
  return res.json();
};

/**
 * Fetch the Cognee memory provenance graph (nodes + edges) for a project.
 * Returns { nodes: [...], edges: [...] }
 */
export const getMemoryGraph = async (project_id) => {
  const res = await fetch(`${BASE}/memory/graph?project_id=${project_id}`);
  if (!res.ok) throw new Error(`Memory graph fetch failed: ${res.status}`);
  return res.json();
};

/**
 * Get HTML visualization of the Cognee memory provenance graph.
 * Returns HTML string for embedding in an iframe.
 */
export const getMemoryVisualization = async (project_id) => {
  const res = await fetch(`${BASE}/memory/visualize?project_id=${project_id}`);
  if (!res.ok) throw new Error(`Memory visualization fetch failed: ${res.status}`);
  return res.text();
};
