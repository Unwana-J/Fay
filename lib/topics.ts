export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface Topic {
  id: string;
  text: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  estimatedReadingMin?: number;
}

export const CATEGORIES = [
  "Artificial Intelligence",
  "Product Management",
  "Technology",
  "Software Engineering",
  "Finance",
  "Economics",
  "Psychology",
  "Business",
  "Marketing",
  "History",
  "Politics",
  "Science",
  "Philosophy",
  "Design",
  "Public Speaking",
  "Startups",
  "Culture",
  "Wildcard",
  "Medicine",
  "Personal Finance",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  "Artificial Intelligence": "#5C615C",   // Muted Sage Slate
  "Product Management": "#A67C1E",        // Bronze Gold
  "Technology": "#444E2C",                // Forest Olive
  "Software Engineering": "#5F6B43",      // Light Sage
  "Finance": "#8C6239",                   // Sienna Walnut
  "Economics": "#7A1C2E",                 // Burgundy Red
  "Psychology": "#8D6E63",                // Muted Clay
  "Business": "#9E7B66",                  // Muted Almond
  "Marketing": "#C68A4C",                 // Warm Ochre
  "History": "#805A36",                   // Warm Copper
  "Politics": "#4E5460",                  // Slate Navy
  "Science": "#3B6360",                   // Vintage Teal
  "Philosophy": "#5A4565",                // Muted Plum
  "Design": "#905A65",                    // Dusty Rose
  "Public Speaking": "#5C6C38",           // Warm Leaf Green
  "Startups": "#B08030",                  // Warm Brass
  "Culture": "#7A5C3A",                   // Warm Terracotta Brown
  "Wildcard": "#6B4C7A",                  // Deep Violet
  "Medicine": "#8B2635",                  // Deep Berry Red
  "Personal Finance": "#2C6E49",          // Forest Green
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Artificial Intelligence": "🤖",
  "Product Management": "🗺️",
  "Technology": "💻",
  "Software Engineering": "⚙️",
  "Finance": "💰",
  "Economics": "📈",
  "Psychology": "🧠",
  "Business": "🏢",
  "Marketing": "📣",
  "History": "📜",
  "Politics": "🏛️",
  "Science": "🔬",
  "Philosophy": "🪬",
  "Design": "🎨",
  "Public Speaking": "🎙️",
  "Startups": "🚀",
  "Culture": "🎭",
  "Wildcard": "🎲",
  "Medicine": "🩺",
  "Personal Finance": "💳",
};

export const TOPIC_BANK: Topic[] = [
  // ─── Artificial Intelligence ───────────────────────────────────────────────
  { id: "ai-1", text: "What is artificial intelligence, and why does it matter now?", category: "Artificial Intelligence", difficulty: "beginner", tags: ["foundations", "overview"] },
  { id: "ai-2", text: "How does machine learning differ from traditional programming?", category: "Artificial Intelligence", difficulty: "beginner", tags: ["ml", "programming"] },
  { id: "ai-3", text: "How do neural networks learn from data?", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["neural networks", "learning"] },
  { id: "ai-4", text: "Explain how transformers revolutionized natural language processing.", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["transformers", "nlp"] },
  { id: "ai-5", text: "What are large language models and how do they generate text?", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["llm", "generation"] },
  { id: "ai-6", text: "How does reinforcement learning from human feedback (RLHF) shape AI behavior?", category: "Artificial Intelligence", difficulty: "advanced", tags: ["rlhf", "alignment"] },
  { id: "ai-7", text: "Compare supervised, unsupervised, and reinforcement learning.", category: "Artificial Intelligence", difficulty: "advanced", tags: ["learning types"] },
  { id: "ai-8", text: "Should AI systems be given legal personhood? Defend your position.", category: "Artificial Intelligence", difficulty: "expert", tags: ["ethics", "law"] },
  { id: "ai-9", text: "Is AGI inevitable, and what does that mean for humanity?", category: "Artificial Intelligence", difficulty: "expert", tags: ["agi", "future"] },

  // ─── Product Management ────────────────────────────────────────────────────
  { id: "pm-1", text: "What does a Product Manager actually do day-to-day?", category: "Product Management", difficulty: "beginner", tags: ["role", "overview"] },
  { id: "pm-2", text: "Explain the difference between product strategy and product roadmap.", category: "Product Management", difficulty: "beginner", tags: ["strategy", "roadmap"] },
  { id: "pm-3", text: "How do you prioritize features when everything feels urgent?", category: "Product Management", difficulty: "intermediate", tags: ["prioritization", "frameworks"] },
  { id: "pm-4", text: "What makes a good product requirement document (PRD)?", category: "Product Management", difficulty: "intermediate", tags: ["documentation", "prd"] },
  { id: "pm-5", text: "How do you define and measure product-market fit?", category: "Product Management", difficulty: "advanced", tags: ["pmf", "metrics"] },
  { id: "pm-6", text: "Compare OKRs and KPIs — when should you use each?", category: "Product Management", difficulty: "advanced", tags: ["okr", "kpi", "metrics"] },
  { id: "pm-7", text: "How should a PM balance user needs against business goals against technical constraints?", category: "Product Management", difficulty: "expert", tags: ["tradeoffs", "stakeholders"] },

  // ─── Technology ────────────────────────────────────────────────────────────
  { id: "tech-1", text: "How does the internet actually work, from typing a URL to seeing a page?", category: "Technology", difficulty: "beginner", tags: ["networking", "dns"] },
  { id: "tech-2", text: "What is cloud computing and why did it transform software development?", category: "Technology", difficulty: "beginner", tags: ["cloud", "infrastructure"] },
  { id: "tech-3", text: "How does end-to-end encryption protect your messages?", category: "Technology", difficulty: "intermediate", tags: ["encryption", "security"] },
  { id: "tech-4", text: "How does a blockchain actually reach consensus?", category: "Technology", difficulty: "intermediate", tags: ["blockchain", "consensus"] },
  { id: "tech-5", text: "What happens to privacy when everything becomes a sensor?", category: "Technology", difficulty: "advanced", tags: ["privacy", "iot"] },
  { id: "tech-6", text: "Should facial recognition be banned in public spaces? Defend your answer.", category: "Technology", difficulty: "expert", tags: ["ethics", "surveillance"] },
  { id: "tech-7", text: "Should social media platforms be legally responsible for the content posted on them?", category: "Technology", difficulty: "intermediate", tags: ["social media", "regulation", "law"] },
  { id: "tech-8", text: "Is open-source software more secure than proprietary software?", category: "Technology", difficulty: "intermediate", tags: ["open-source", "security"] },
  { id: "tech-9", text: "Are smartphones making us more or less connected to each other?", category: "Technology", difficulty: "beginner", tags: ["smartphones", "connection", "society"] },
  { id: "tech-10", text: "Should there be a minimum age for owning a smartphone? What would you set it at and why?", category: "Technology", difficulty: "intermediate", tags: ["smartphones", "children", "policy"] },
  { id: "tech-11", text: "What is the strongest argument against fully autonomous weapons?", category: "Technology", difficulty: "advanced", tags: ["AI", "weapons", "ethics", "warfare"] },
  { id: "tech-12", text: "Is remote work a net win for productivity, or a net loss? Defend a position.", category: "Technology", difficulty: "intermediate", tags: ["remote work", "productivity", "work culture"] },
  { id: "tech-13", text: "How should companies handle the personal data of users who have died?", category: "Technology", difficulty: "advanced", tags: ["data", "privacy", "ethics", "death"] },

  // ─── Software Engineering ──────────────────────────────────────────────────
  { id: "se-1", text: "What is version control and why is Git essential?", category: "Software Engineering", difficulty: "beginner", tags: ["git", "basics"] },
  { id: "se-2", text: "Explain object-oriented programming with a real-world analogy.", category: "Software Engineering", difficulty: "beginner", tags: ["oop", "fundamentals"] },
  { id: "se-3", text: "What is a RESTful API and how does it work?", category: "Software Engineering", difficulty: "intermediate", tags: ["api", "rest"] },
  { id: "se-4", text: "How does a database index speed up queries?", category: "Software Engineering", difficulty: "intermediate", tags: ["database", "indexing"] },
  { id: "se-5", text: "Explain the CAP theorem and its real-world implications.", category: "Software Engineering", difficulty: "advanced", tags: ["distributed systems", "cap"] },
  { id: "se-6", text: "Compare microservices and monoliths — how do you decide which is right?", category: "Software Engineering", difficulty: "advanced", tags: ["architecture", "microservices"] },
  { id: "se-7", text: "Proof of Work vs. Proof of Stake — which should blockchains use?", category: "Software Engineering", difficulty: "expert", tags: ["blockchain", "consensus"] },

  // ─── Finance ───────────────────────────────────────────────────────────────
  { id: "fin-1", text: "What is compound interest and why is it called the eighth wonder of the world?", category: "Finance", difficulty: "beginner", tags: ["compound interest", "investing"] },
  { id: "fin-2", text: "How do stock markets actually work?", category: "Finance", difficulty: "beginner", tags: ["stocks", "markets"] },
  { id: "fin-3", text: "How does SWIFT enable international money transfers?", category: "Finance", difficulty: "intermediate", tags: ["swift", "banking"] },
  { id: "fin-4", text: "Explain the risk-return tradeoff in portfolio management.", category: "Finance", difficulty: "intermediate", tags: ["portfolio", "risk"] },
  { id: "fin-5", text: "How do central banks use interest rates to control the economy?", category: "Finance", difficulty: "advanced", tags: ["central bank", "interest rates"] },
  { id: "fin-6", text: "Is passive index investing better than active fund management? Defend a position.", category: "Finance", difficulty: "expert", tags: ["investing", "index funds"] },

  // ─── Economics ─────────────────────────────────────────────────────────────
  { id: "eco-1", text: "Explain inflation to someone who has never taken an economics class.", category: "Economics", difficulty: "beginner", tags: ["inflation", "basics"] },
  { id: "eco-2", text: "What is supply and demand, and what happens when it breaks?", category: "Economics", difficulty: "beginner", tags: ["supply", "demand"] },
  { id: "eco-3", text: "How does quantitative easing work and what are its risks?", category: "Economics", difficulty: "intermediate", tags: ["qe", "monetary policy"] },
  { id: "eco-4", text: "What causes a recession and how do governments respond?", category: "Economics", difficulty: "intermediate", tags: ["recession", "policy"] },
  { id: "eco-5", text: "Is a universal basic income realistic at national scale?", category: "Economics", difficulty: "advanced", tags: ["ubi", "policy"] },
  { id: "eco-6", text: "Should wealth inequality be solved through taxation or market mechanisms?", category: "Economics", difficulty: "expert", tags: ["inequality", "taxation"] },

  // ─── Psychology ────────────────────────────────────────────────────────────
  { id: "psy-1", text: "Why do we dream, and does it matter that we don't fully know?", category: "Psychology", difficulty: "beginner", tags: ["dreams", "neuroscience"] },
  { id: "psy-2", text: "What is cognitive bias and how does it affect decision-making?", category: "Psychology", difficulty: "beginner", tags: ["bias", "decision-making"] },
  { id: "psy-3", text: "How does the placebo effect work, and what does it reveal about the brain?", category: "Psychology", difficulty: "intermediate", tags: ["placebo", "brain"] },
  { id: "psy-4", text: "Explain Maslow's hierarchy of needs and its limitations.", category: "Psychology", difficulty: "intermediate", tags: ["maslow", "motivation"] },
  { id: "psy-5", text: "How does trauma reshape the brain, and can it be reversed?", category: "Psychology", difficulty: "advanced", tags: ["trauma", "neuroplasticity"] },
  { id: "psy-6", text: "Is free will real, or are all our choices determined by prior causes?", category: "Psychology", difficulty: "expert", tags: ["free will", "determinism"] },

  // ─── Business ──────────────────────────────────────────────────────────────
  { id: "biz-1", text: "What is a business model and how do companies make money?", category: "Business", difficulty: "beginner", tags: ["business model", "revenue"] },
  { id: "biz-2", text: "Explain Porter's Five Forces with a real company as an example.", category: "Business", difficulty: "intermediate", tags: ["strategy", "porter"] },
  { id: "biz-3", text: "Why do most mergers fail to create the value they promised?", category: "Business", difficulty: "intermediate", tags: ["mergers", "m&a"] },
  { id: "biz-4", text: "What's the real difference between a monopoly and just being really good?", category: "Business", difficulty: "advanced", tags: ["monopoly", "competition"] },
  { id: "biz-5", text: "Should CEOs be paid a fixed multiple of their lowest-paid employee?", category: "Business", difficulty: "expert", tags: ["compensation", "ethics"] },
  { id: "biz-6", text: "Should companies pay different salaries for the same remote role based on where the employee lives?", category: "Business", difficulty: "advanced", tags: ["remote work", "pay equity", "compensation"] },

  // ─── Marketing ─────────────────────────────────────────────────────────────
  { id: "mkt-1", text: "What is brand positioning and why does it matter?", category: "Marketing", difficulty: "beginner", tags: ["brand", "positioning"] },
  { id: "mkt-2", text: "How does content marketing differ from traditional advertising?", category: "Marketing", difficulty: "beginner", tags: ["content", "advertising"] },
  { id: "mkt-3", text: "Explain the customer acquisition funnel and the metrics that matter.", category: "Marketing", difficulty: "intermediate", tags: ["funnel", "cac", "metrics"] },
  { id: "mkt-4", text: "How does viral marketing actually work — can it be engineered?", category: "Marketing", difficulty: "advanced", tags: ["viral", "growth"] },
  { id: "mkt-5", text: "Is growth hacking sustainable, or does it damage brand trust?", category: "Marketing", difficulty: "expert", tags: ["growth hacking", "brand"] },

  // ─── History ───────────────────────────────────────────────────────────────
  { id: "his-1", text: "Was the printing press the internet of its time?", category: "History", difficulty: "beginner", tags: ["printing press", "information"] },
  { id: "his-2", text: "What's a historical event people misunderstand because of how it's taught?", category: "History", difficulty: "intermediate", tags: ["misconceptions", "education"] },
  { id: "his-3", text: "Why do empires actually collapse — pick one and explain it.", category: "History", difficulty: "advanced", tags: ["empires", "collapse"] },
  { id: "his-4", text: "Should we judge historical figures by today's moral standards?", category: "History", difficulty: "expert", tags: ["morality", "context"] },
  { id: "his-5", text: "What's a small historical decision that changed everything after it?", category: "History", difficulty: "intermediate", tags: ["turning points", "decisions"] },

  // ─── Politics ──────────────────────────────────────────────────────────────
  { id: "pol-1", text: "What is the difference between democracy and a republic?", category: "Politics", difficulty: "beginner", tags: ["democracy", "government"] },
  { id: "pol-2", text: "Should voting be mandatory? Argue a position.", category: "Politics", difficulty: "intermediate", tags: ["voting", "civic duty"] },
  { id: "pol-3", text: "How does gerrymandering undermine democratic elections?", category: "Politics", difficulty: "intermediate", tags: ["gerrymandering", "elections"] },
  { id: "pol-4", text: "Is cancel culture a form of accountability or mob justice?", category: "Politics", difficulty: "advanced", tags: ["cancel culture", "speech"] },
  { id: "pol-5", text: "Can liberal democracy survive in the age of social media? Defend your view.", category: "Politics", difficulty: "expert", tags: ["democracy", "social media"] },

  // ─── Science ───────────────────────────────────────────────────────────────
  { id: "sci-1", text: "What would change if we discovered microbial life on Mars?", category: "Science", difficulty: "beginner", tags: ["astrobiology", "space"] },
  { id: "sci-2", text: "Explain why vaccines work to someone skeptical of them.", category: "Science", difficulty: "intermediate", tags: ["vaccines", "immunology"] },
  { id: "sci-3", text: "What's the best evidence that the universe had a beginning?", category: "Science", difficulty: "advanced", tags: ["cosmology", "big bang"] },
  { id: "sci-4", text: "Should gene editing of human embryos ever be allowed?", category: "Science", difficulty: "expert", tags: ["crispr", "ethics", "bioethics"] },
  { id: "sci-5", text: "Is aging a disease we could eventually cure?", category: "Science", difficulty: "advanced", tags: ["aging", "longevity"] },
  { id: "sci-6", text: "Should we bring back extinct species if the technology exists? Pick one and make the case.", category: "Science", difficulty: "advanced", tags: ["de-extinction", "biology", "ethics"] },

  // ─── Philosophy ────────────────────────────────────────────────────────────
  { id: "phi-1", text: "What is the trolley problem and why do philosophers care about it?", category: "Philosophy", difficulty: "beginner", tags: ["ethics", "trolley problem"] },
  { id: "phi-2", text: "Explain Plato's allegory of the cave and what it says about knowledge.", category: "Philosophy", difficulty: "intermediate", tags: ["plato", "epistemology"] },
  { id: "phi-3", text: "What did Nietzsche mean by 'God is dead' and was he right?", category: "Philosophy", difficulty: "advanced", tags: ["nietzsche", "meaning"] },
  { id: "phi-4", text: "Is consciousness purely physical, or does it require something more?", category: "Philosophy", difficulty: "expert", tags: ["consciousness", "mind-body"] },
  { id: "phi-5", text: "Can morality be objective, or is it always relative?", category: "Philosophy", difficulty: "advanced", tags: ["morality", "relativism"] },

  // ─── Design ────────────────────────────────────────────────────────────────
  { id: "des-1", text: "What is the difference between UX and UI design?", category: "Design", difficulty: "beginner", tags: ["ux", "ui"] },
  { id: "des-2", text: "Explain the 10 usability heuristics by Jakob Nielsen.", category: "Design", difficulty: "intermediate", tags: ["usability", "heuristics"] },
  { id: "des-3", text: "How does color psychology influence product design decisions?", category: "Design", difficulty: "intermediate", tags: ["color", "psychology"] },
  { id: "des-4", text: "What makes great design — is it aesthetic, functional, or cultural?", category: "Design", difficulty: "advanced", tags: ["design principles", "aesthetics"] },
  { id: "des-5", text: "Should designers always prioritize user research over their own intuition?", category: "Design", difficulty: "expert", tags: ["research", "intuition"] },

  // ─── Public Speaking ───────────────────────────────────────────────────────
  { id: "ps-1", text: "What makes a great opening line for any speech?", category: "Public Speaking", difficulty: "beginner", tags: ["openings", "hooks"] },
  { id: "ps-2", text: "How do you structure an argument so it's impossible to ignore?", category: "Public Speaking", difficulty: "intermediate", tags: ["structure", "argument"] },
  { id: "ps-3", text: "How do TED speakers create the 'idea worth spreading' moment?", category: "Public Speaking", difficulty: "intermediate", tags: ["ted", "storytelling"] },
  { id: "ps-4", text: "How does rhetoric differ from manipulation, and where is the line?", category: "Public Speaking", difficulty: "advanced", tags: ["rhetoric", "persuasion"] },
  { id: "ps-5", text: "Is authenticity more persuasive than technique when speaking in public?", category: "Public Speaking", difficulty: "expert", tags: ["authenticity", "technique"] },

  // ─── Startups ──────────────────────────────────────────────────────────────
  { id: "sta-1", text: "What is a minimum viable product and why does it matter?", category: "Startups", difficulty: "beginner", tags: ["mvp", "lean"] },
  { id: "sta-2", text: "How do venture capitalists decide which startups to fund?", category: "Startups", difficulty: "intermediate", tags: ["vc", "funding"] },
  { id: "sta-3", text: "Is venture capital good or bad for innovation long-term?", category: "Startups", difficulty: "advanced", tags: ["vc", "innovation"] },
  { id: "sta-4", text: "What's the difference between a startup and a small business?", category: "Startups", difficulty: "beginner", tags: ["startup", "business"] },
  { id: "sta-5", text: "Why do most startups fail, and what separates the ones that don't?", category: "Startups", difficulty: "intermediate", tags: ["failure", "survival"] },
  { id: "sta-6", text: "Should a startup always raise money, or can bootstrapping win?", category: "Startups", difficulty: "advanced", tags: ["bootstrapping", "fundraising"] },
  { id: "sta-7", text: "Pitch an invention that doesn't exist yet but should — and defend it.", category: "Startups", difficulty: "expert", tags: ["pitch", "innovation"] },

  // ─── Culture ───────────────────────────────────────────────────────────────
  { id: "cul-1", text: "Is nostalgia helping or hurting how we create new art and culture?", category: "Culture", difficulty: "intermediate", tags: ["nostalgia", "art", "creativity"] },
  { id: "cul-2", text: "Should tipping culture exist at all, or should service workers just be paid fairly?", category: "Culture", difficulty: "beginner", tags: ["tipping", "labour", "wages"] },
  { id: "cul-3", text: "What does a city owe the people who can no longer afford to live in it?", category: "Culture", difficulty: "advanced", tags: ["gentrification", "housing", "city"] },
  { id: "cul-4", text: "Is a four-day work week actually better for society, or just better for some?", category: "Culture", difficulty: "intermediate", tags: ["work week", "productivity", "wellbeing"] },
  { id: "cul-5", text: "Are we becoming worse at being bored, and does it matter?", category: "Culture", difficulty: "beginner", tags: ["boredom", "attention", "technology"] },
  { id: "cul-6", text: "Should museums and galleries return artifacts to their countries of origin?", category: "Culture", difficulty: "intermediate", tags: ["museums", "colonialism", "repatriation"] },
  { id: "cul-7", text: "What is truly lost when a language goes extinct?", category: "Culture", difficulty: "intermediate", tags: ["language", "identity", "extinction"] },
  { id: "cul-8", text: "Is cancel culture a genuine form of social accountability, or mob justice with no due process?", category: "Culture", difficulty: "advanced", tags: ["cancel culture", "accountability", "speech"] },
  { id: "cul-9", text: "Should voting be mandatory? What happens to democracy if it isn't?", category: "Culture", difficulty: "intermediate", tags: ["voting", "democracy", "civic duty"] },
  { id: "cul-10", text: "Has the democratization of art through digital platforms degraded its value or redefined it?", category: "Culture", difficulty: "advanced", tags: ["art", "digitalization", "value"] },
  { id: "cul-11", text: "Analyze how the commodification of social movements affects their long-term efficacy.", category: "Culture", difficulty: "expert", tags: ["social movements", "commodification", "activism"] },
  { id: "cul-12", text: "Is the rise of global monoculture destroying indigenous perspectives, or creating a new shared human language?", category: "Culture", difficulty: "advanced", tags: ["monoculture", "indigenous", "globalization"] },
  { id: "cul-13", text: "Does secularization leave a psychological void in modern society, and what is filling it?", category: "Culture", difficulty: "expert", tags: ["secularization", "religion", "modernity"] },
  { id: "cul-14", text: "Is the preservation of historically oppressive cultural monuments necessary for historical truth, or an active harm?", category: "Culture", difficulty: "advanced", tags: ["monuments", "history", "oppression"] },
  { id: "cul-15", text: "How does the language we speak influence the structure of our thoughts? Argue for or against strong linguistic determinism (the Sapir-Whorf hypothesis).", category: "Culture", difficulty: "expert", tags: ["linguistics", "determinism", "thought"] },

  // ─── Wildcard ──────────────────────────────────────────────────────────────
  { id: "wild-1", text: "Make the strongest possible case for your most unpopular food opinion.", category: "Wildcard", difficulty: "beginner", tags: ["opinion", "food", "fun"] },
  { id: "wild-2", text: "If you had to teach a class on any subject in one hour with zero prep, what would it be on and how would you open?", category: "Wildcard", difficulty: "beginner", tags: ["teaching", "knowledge", "improvisation"] },
  { id: "wild-3", text: "What's a skill that looks completely useless but actually compounds quietly over a lifetime?", category: "Wildcard", difficulty: "intermediate", tags: ["skills", "compounding", "life"] },
  { id: "wild-4", text: "Describe the place you grew up to someone who has never left their village.", category: "Wildcard", difficulty: "intermediate", tags: ["storytelling", "place", "description"] },
  { id: "wild-5", text: "What would you change about how school taught you to think — not what to think, but how?", category: "Wildcard", difficulty: "intermediate", tags: ["education", "critical thinking", "reform"] },
  { id: "wild-6", text: "Explain a concept from your job or field to a curious 10-year-old.", category: "Wildcard", difficulty: "beginner", tags: ["explanation", "simplicity", "teaching"] },
  { id: "wild-7", text: "What's the most valuable thing you've learned that you couldn't have been taught in school?", category: "Wildcard", difficulty: "intermediate", tags: ["self-knowledge", "experience", "growth"] },
  { id: "wild-8", text: "If you had to construct a new moral philosophy from first principles, what would be your baseline axiom?", category: "Wildcard", difficulty: "expert", tags: ["philosophy", "ethics", "first principles"] },
  { id: "wild-9", text: "What is a concept or paradox (e.g., Gödel's Incompleteness or the Fermi Paradox) that profoundly reshaped how you view reality?", category: "Wildcard", difficulty: "advanced", tags: ["paradoxes", "reality", "science"] },
  { id: "wild-10", text: "Is it possible to truly understand another person's subjective experience (qualia), or are we fundamentally isolated minds?", category: "Wildcard", difficulty: "expert", tags: ["qualia", "philosophy of mind", "consciousness"] },
  { id: "wild-11", text: "Argue whether humanity is a net-positive or net-negative presence on Earth from an ecological standpoint.", category: "Wildcard", difficulty: "advanced", tags: ["ecology", "humanity", "environment"] },
  { id: "wild-12", text: "What is the most intellectually rigorous argument you can make against a belief you hold deeply?", category: "Wildcard", difficulty: "expert", tags: ["beliefs", "critical thinking", "intellectual humility"] },
  { id: "wild-13", text: "If all human knowledge was wiped out tomorrow and you could only save one sentence for the next generation, what would it be and why?", category: "Wildcard", difficulty: "advanced", tags: ["knowledge", "civilization", "future"] },

{ id: "ai-10", text: "How will LLMs change the nature of search engines and internet browsing?", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["search","llm"] },
  { id: "ai-11", text: "Explain the difference between parameters and weights in a neural network.", category: "Artificial Intelligence", difficulty: "beginner", tags: ["parameters","weights"] },
  { id: "ai-12", text: "What is generative adversarial network (GAN) and how is it used to create deepfakes?", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["gan","deepfakes"] },
  { id: "ai-13", text: "How does retrieval-augmented generation (RAG) address hallucination in LLMs?", category: "Artificial Intelligence", difficulty: "advanced", tags: ["rag","hallucinations"] },
  { id: "ai-14", text: "What is the alignment problem in AI safety, and why is it so hard to solve?", category: "Artificial Intelligence", difficulty: "advanced", tags: ["alignment","safety"] },
  { id: "ai-15", text: "How do vector databases enable fast semantic search for AI systems?", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["vector db","semantic search"] },
  { id: "ai-16", text: "Should copyright law protect artists whose work is used to train AI models?", category: "Artificial Intelligence", difficulty: "expert", tags: ["copyright","ethics"] },
  { id: "ai-17", text: "Explain the difference between weak AI, strong AI, and superintelligence.", category: "Artificial Intelligence", difficulty: "beginner", tags: ["weak ai","superintelligence"] },
  { id: "ai-18", text: "What is neural architecture search (NAS), and how does it automate AI design?", category: "Artificial Intelligence", difficulty: "expert", tags: ["nas","automl"] },
  { id: "ai-19", text: "How does computer vision detect objects in autonomous driving in real time?", category: "Artificial Intelligence", difficulty: "intermediate", tags: ["computer vision","autonomous driving"] },
  { id: "pm-8", text: "What is a value proposition, and how do you write a compelling one?", category: "Product Management", difficulty: "beginner", tags: ["value prop","marketing"] },
  { id: "pm-9", text: "How do you conduct user interviews to extract unbiased feedback?", category: "Product Management", difficulty: "intermediate", tags: ["user interviews","research"] },
  { id: "pm-10", text: "What is the North Star Metric, and how does it align product teams?", category: "Product Management", difficulty: "intermediate", tags: ["north star","metrics"] },
  { id: "pm-11", text: "How do you manage stakeholder requests when they conflict with the roadmap?", category: "Product Management", difficulty: "advanced", tags: ["stakeholders","alignment"] },
  { id: "pm-12", text: "Explain the concept of 'product led growth' (PLG) and its benefits.", category: "Product Management", difficulty: "intermediate", tags: ["plg","growth"] },
  { id: "pm-13", text: "What is a pricing strategy, and how do you test subscription tiers?", category: "Product Management", difficulty: "advanced", tags: ["pricing","subscriptions"] },
  { id: "pm-14", text: "How do you decide when to sunset a feature or an entire product?", category: "Product Management", difficulty: "expert", tags: ["sunsetting","lifecycle"] },
  { id: "pm-15", text: "Explain the difference between qualitative and quantitative product research.", category: "Product Management", difficulty: "beginner", tags: ["qualitative","quantitative"] },
  { id: "pm-16", text: "What is churn rate, and what are the main product strategies to reduce it?", category: "Product Management", difficulty: "intermediate", tags: ["churn","retention"] },
  { id: "pm-17", text: "How do you use behavioral cohort analysis to identify sticky product features?", category: "Product Management", difficulty: "expert", tags: ["cohorts","stickiness"] },
  { id: "tech-14", text: "How does 5G technology enable IoT expansion and real-time automation?", category: "Technology", difficulty: "beginner", tags: ["5g","iot"] },
  { id: "tech-15", text: "Explain the difference between virtual reality (VR) and augmented reality (AR).", category: "Technology", difficulty: "beginner", tags: ["vr","ar"] },
  { id: "tech-16", text: "What is quantum computing, and how does it differ from classical computing?", category: "Technology", difficulty: "intermediate", tags: ["quantum","computation"] },
  { id: "tech-17", text: "How does the DNS system resolve a domain name to an IP address?", category: "Technology", difficulty: "intermediate", tags: ["dns","networking"] },
  { id: "tech-18", text: "What is the edge computing model, and when is it preferred over cloud?", category: "Technology", difficulty: "advanced", tags: ["edge computing","latency"] },
  { id: "tech-19", text: "How do password managers secure data using zero-knowledge architecture?", category: "Technology", difficulty: "intermediate", tags: ["passwords","security"] },
  { id: "tech-20", text: "Should governments regulate space debris in low Earth orbit?", category: "Technology", difficulty: "expert", tags: ["space","regulation"] },
  { id: "tech-21", text: "What is the semantic web, and how does it seek to organize information?", category: "Technology", difficulty: "advanced", tags: ["web3","semantic"] },
  { id: "tech-22", text: "Explain the concept of net neutrality and why it is contentious.", category: "Technology", difficulty: "beginner", tags: ["net neutrality","policy"] },
  { id: "tech-23", text: "How do deep sea fiber optic cables power global internet connectivity?", category: "Technology", difficulty: "intermediate", tags: ["fiber optics","infrastructure"] },
  { id: "se-8", text: "What is continuous integration and continuous deployment (CI/CD)?", category: "Software Engineering", difficulty: "beginner", tags: ["cicd","devops"] },
  { id: "se-9", text: "Explain the difference between SQL and NoSQL databases.", category: "Software Engineering", difficulty: "beginner", tags: ["sql","nosql"] },
  { id: "se-10", text: "What is a memory leak, and how do garbage collectors find them?", category: "Software Engineering", difficulty: "intermediate", tags: ["memory","garbage collection"] },
  { id: "se-11", text: "How does containerization (e.g. Docker) solve the dependency problem?", category: "Software Engineering", difficulty: "intermediate", tags: ["docker","containers"] },
  { id: "se-12", text: "What is clean code, and what are the SOLID design principles?", category: "Software Engineering", difficulty: "advanced", tags: ["solid","clean code"] },
  { id: "se-13", text: "Explain how asymmetric cryptography (public-private keys) works.", category: "Software Engineering", difficulty: "intermediate", tags: ["cryptography","security"] },
  { id: "se-14", text: "What is load balancing, and how does it prevent service downtime?", category: "Software Engineering", difficulty: "advanced", tags: ["load balancing","scaling"] },
  { id: "se-15", text: "Should developers automate all testing? What are the tradeoffs?", category: "Software Engineering", difficulty: "expert", tags: ["testing","automation"] },
  { id: "se-16", text: "Explain compilation versus interpretation in programming languages.", category: "Software Engineering", difficulty: "beginner", tags: ["compilers","interpreters"] },
  { id: "se-17", text: "How does concurrent programming handle race conditions and deadlocks?", category: "Software Engineering", difficulty: "expert", tags: ["concurrency","threading"] },
  { id: "fin-7", text: "What is liquidity, and why is it vital for banks during a crisis?", category: "Finance", difficulty: "intermediate", tags: ["liquidity","banking"] },
  { id: "fin-8", text: "Explain the difference between a bull market and a bear market.", category: "Finance", difficulty: "beginner", tags: ["markets","investing"] },
  { id: "fin-9", text: "What are bonds, and how do interest rates affect bond prices?", category: "Finance", difficulty: "intermediate", tags: ["bonds","yields"] },
  { id: "fin-10", text: "How do derivatives (options and futures) hedge market risk?", category: "Finance", difficulty: "advanced", tags: ["derivatives","hedging"] },
  { id: "fin-11", text: "What is a corporate credit rating, and who determines it?", category: "Finance", difficulty: "beginner", tags: ["credit","rating"] },
  { id: "fin-12", text: "Explain how high-frequency trading (HFT) impacts market liquidity.", category: "Finance", difficulty: "advanced", tags: ["hft","liquidity"] },
  { id: "fin-13", text: "What is systemic risk, and how was it demonstrated in the 2008 financial crisis?", category: "Finance", difficulty: "expert", tags: ["systemic risk","crisis"] },
  { id: "fin-14", text: "What is decentralized finance (DeFi), and can it replace central banks?", category: "Finance", difficulty: "expert", tags: ["defi","crypto"] },
  { id: "fin-15", text: "Explain the difference between venture capital and private equity.", category: "Finance", difficulty: "intermediate", tags: ["vc","pe"] },
  { id: "fin-16", text: "How does currency devaluation affect national imports and exports?", category: "Finance", difficulty: "intermediate", tags: ["currency","macro"] },
  { id: "eco-7", text: "What is GDP, and why is it used as a primary gauge of economic health?", category: "Economics", difficulty: "beginner", tags: ["gdp","growth"] },
  { id: "eco-8", text: "Explain the difference between microeconomics and macroeconomics.", category: "Economics", difficulty: "beginner", tags: ["micro","macro"] },
  { id: "eco-9", text: "What is game theory, and how does the Nash Equilibrium model market competition?", category: "Economics", difficulty: "intermediate", tags: ["game theory","nash"] },
  { id: "eco-10", text: "How does the federal funds rate cascade through the broader economy?", category: "Economics", difficulty: "intermediate", tags: ["interest rates","monetary"] },
  { id: "eco-11", text: "What is a tariff, and how does it trigger trade wars?", category: "Economics", difficulty: "advanced", tags: ["tariffs","trade"] },
  { id: "eco-12", text: "Explain the concept of comparative advantage in international trade.", category: "Economics", difficulty: "intermediate", tags: ["comparative advantage","trade"] },
  { id: "eco-13", text: "Is carbon taxation the most efficient way to reduce pollution?", category: "Economics", difficulty: "expert", tags: ["carbon tax","externalities"] },
  { id: "eco-14", text: "How does hyperinflation destroy the utility of money as a store of value?", category: "Economics", difficulty: "advanced", tags: ["hyperinflation","monetary"] },
  { id: "eco-15", text: "What is the Laffer Curve, and what does it suggest about tax rates?", category: "Economics", difficulty: "intermediate", tags: ["laffer curve","taxes"] },
  { id: "eco-16", text: "Should the gig economy be subject to minimum wage regulations?", category: "Economics", difficulty: "expert", tags: ["gig economy","labor"] },
  { id: "psy-7", text: "What is cognitive dissonance, and how do humans resolve it?", category: "Psychology", difficulty: "beginner", tags: ["cognitive dissonance","mind"] },
  { id: "psy-8", text: "Explain classical conditioning using Pavlov's experiment as an example.", category: "Psychology", difficulty: "beginner", tags: ["conditioning","behavior"] },
  { id: "psy-9", text: "What is the bystander effect, and why does it occur in groups?", category: "Psychology", difficulty: "intermediate", tags: ["bystander effect","social"] },
  { id: "psy-10", text: "How does dopamine regulate our reward pathway and lead to addiction?", category: "Psychology", difficulty: "intermediate", tags: ["dopamine","neurobiology"] },
  { id: "psy-11", text: "What is neuroplasticity, and how does the brain recover from injury?", category: "Psychology", difficulty: "advanced", tags: ["neuroplasticity","brain"] },
  { id: "psy-12", text: "Explain the difference between system 1 and system 2 thinking.", category: "Psychology", difficulty: "intermediate", tags: ["system 1","system 2"] },
  { id: "psy-13", text: "How does attachment theory explain adult relationship patterns?", category: "Psychology", difficulty: "advanced", tags: ["attachment theory","relationships"] },
  { id: "psy-14", text: "Is emotional intelligence (EQ) a better predictor of success than IQ?", category: "Psychology", difficulty: "expert", tags: ["eq","iq"] },
  { id: "psy-15", text: "What is the placebo effect, and how does it manifest physically?", category: "Psychology", difficulty: "beginner", tags: ["placebo","mind-body"] },
  { id: "psy-16", text: "How do early childhood environments influence personality development?", category: "Psychology", difficulty: "expert", tags: ["developmental","personality"] },
  { id: "biz-7", text: "What is customer lifetime value (LTV), and how do you calculate it?", category: "Business", difficulty: "beginner", tags: ["ltv","metrics"] },
  { id: "biz-8", text: "Explain the network effect using social media platforms as an example.", category: "Business", difficulty: "beginner", tags: ["network effects","strategy"] },
  { id: "biz-9", text: "What is a SWOT analysis, and how do strategic planners use it?", category: "Business", difficulty: "intermediate", tags: ["swot","planning"] },
  { id: "biz-10", text: "How do switching costs lock customers into a product ecosystem?", category: "Business", difficulty: "intermediate", tags: ["switching costs","moats"] },
  { id: "biz-11", text: "What is disruptive innovation, and how do startups unseat giants?", category: "Business", difficulty: "advanced", tags: ["disruption","christensen"] },
  { id: "biz-12", text: "Explain the agency problem in corporate governance.", category: "Business", difficulty: "intermediate", tags: ["agency problem","governance"] },
  { id: "biz-13", text: "How do supply chain disruptions cascade across global manufacturing?", category: "Business", difficulty: "advanced", tags: ["supply chain","logistics"] },
  { id: "biz-14", text: "Should business decisions prioritize stakeholder value over shareholder value?", category: "Business", difficulty: "expert", tags: ["stakeholders","ethics"] },
  { id: "biz-15", text: "What is vertical integration, and when is it a sound strategy?", category: "Business", difficulty: "intermediate", tags: ["vertical integration","strategy"] },
  { id: "biz-16", text: "How do corporate acquisitions create or destroy shareholder wealth?", category: "Business", difficulty: "expert", tags: ["m&a","finance"] },
  { id: "mkt-6", text: "What is search engine optimization (SEO), and why does it matter?", category: "Marketing", difficulty: "beginner", tags: ["seo","basics"] },
  { id: "mkt-7", text: "Explain the difference between inbound and outbound marketing.", category: "Marketing", difficulty: "beginner", tags: ["inbound","outbound"] },
  { id: "mkt-8", text: "What is conversion rate optimization (CRO), and how is it measured?", category: "Marketing", difficulty: "intermediate", tags: ["cro","metrics"] },
  { id: "mkt-9", text: "How does micro-influencer marketing differ from macro-influencer campaigns?", category: "Marketing", difficulty: "intermediate", tags: ["influencer","social"] },
  { id: "mkt-10", text: "What is neuromarketing, and how does it study consumer brain waves?", category: "Marketing", difficulty: "advanced", tags: ["neuromarketing","biometrics"] },
  { id: "mkt-11", text: "How do brands build emotional connection to command a price premium?", category: "Marketing", difficulty: "intermediate", tags: ["branding","pricing"] },
  { id: "mkt-12", text: "Explain the concept of lookalike audiences in digital advertising.", category: "Marketing", difficulty: "advanced", tags: ["ads","targeting"] },
  { id: "mkt-13", text: "Should behavioral tracking for hyper-targeted ads be banned?", category: "Marketing", difficulty: "expert", tags: ["privacy","ethics"] },
  { id: "mkt-14", text: "What is experiential marketing, and how does it create memorable events?", category: "Marketing", difficulty: "intermediate", tags: ["experiential","events"] },
  { id: "mkt-15", text: "How does search intent shift along the consumer conversion funnel?", category: "Marketing", difficulty: "expert", tags: ["intent","search"] },
  { id: "his-6", text: "What factors led to the rise and fall of the Silk Road?", category: "History", difficulty: "beginner", tags: ["silk road","trade"] },
  { id: "his-7", text: "Explain the causes and immediate outcomes of the French Revolution.", category: "History", difficulty: "intermediate", tags: ["french revolution","france"] },
  { id: "his-8", text: "How did the black plague alter the labor market in medieval Europe?", category: "History", difficulty: "intermediate", tags: ["plague","labor"] },
  { id: "his-9", text: "What was the Space Race, and how did it drive technological breakthroughs?", category: "History", difficulty: "beginner", tags: ["space race","cold war"] },
  { id: "his-10", text: "How did the invention of gunpowder shift balance of power in Europe?", category: "History", difficulty: "advanced", tags: ["gunpowder","military"] },
  { id: "his-11", text: "What was the Meiji Restoration, and how did it modernize Japan?", category: "History", difficulty: "intermediate", tags: ["japan","modernization"] },
  { id: "his-12", text: "How did hyperinflation under the Weimar Republic affect the rise of extremism?", category: "History", difficulty: "advanced", tags: ["weimar","extremism"] },
  { id: "his-13", text: "Did the Marshall Plan successfully rebuild Europe and contain communism?", category: "History", difficulty: "expert", tags: ["marshall plan","cold war"] },
  { id: "his-14", text: "How did the printing press spark the Protestant Reformation?", category: "History", difficulty: "intermediate", tags: ["printing press","reformation"] },
  { id: "his-15", text: "Explain how the code of Hammurabi established early legal systems.", category: "History", difficulty: "expert", tags: ["hammurabi","law"] },
  { id: "pol-6", text: "What is separation of powers, and why is it vital in governance?", category: "Politics", difficulty: "beginner", tags: ["governance","separation"] },
  { id: "pol-7", text: "Explain the difference between left-wing and right-wing political ideologies.", category: "Politics", difficulty: "beginner", tags: ["ideology","spectrum"] },
  { id: "pol-8", text: "What is soft power, and how do nations project it globally?", category: "Politics", difficulty: "intermediate", tags: ["soft power","diplomacy"] },
  { id: "pol-9", text: "How does the Electoral College work, and what are its criticisms?", category: "Politics", difficulty: "intermediate", tags: ["electoral college","voting"] },
  { id: "pol-10", text: "What is populist rhetoric, and why does it thrive in times of economic distress?", category: "Politics", difficulty: "advanced", tags: ["populism","rhetoric"] },
  { id: "pol-11", text: "How does lobbying influence legislation in democratic chambers?", category: "Politics", difficulty: "intermediate", tags: ["lobbying","legislation"] },
  { id: "pol-12", text: "What is the role of the United Nations Security Council, and why is it locked by vetoes?", category: "Politics", difficulty: "advanced", tags: ["un","veto"] },
  { id: "pol-13", text: "Is national sovereignty dead in the age of global supply chains and trade pacts?", category: "Politics", difficulty: "expert", tags: ["sovereignty","globalization"] },
  { id: "pol-14", text: "Explain the tragedy of the commons through global climate policy failure.", category: "Politics", difficulty: "advanced", tags: ["commons","climate"] },
  { id: "pol-15", text: "Should campaign financing be publicly funded to eliminate corporate influence?", category: "Politics", difficulty: "expert", tags: ["campaign finance","lobbying"] },
  { id: "sci-7", text: "What is photosynthesis, and how do plants convert light to energy?", category: "Science", difficulty: "beginner", tags: ["photosynthesis","botany"] },
  { id: "sci-8", text: "Explain the difference between nuclear fission and nuclear fusion.", category: "Science", difficulty: "beginner", tags: ["fission","fusion"] },
  { id: "sci-9", text: "What is dark matter, and how do scientists infer its existence?", category: "Science", difficulty: "intermediate", tags: ["dark matter","astronomy"] },
  { id: "sci-10", text: "How does the greenhouse effect trap heat in Earth's atmosphere?", category: "Science", difficulty: "intermediate", tags: ["greenhouse","climate"] },
  { id: "sci-11", text: "What are quantum superpositions and quantum entanglement?", category: "Science", difficulty: "advanced", tags: ["quantum","physics"] },
  { id: "sci-12", text: "Explain the difference between DNA transcription and translation.", category: "Science", difficulty: "intermediate", tags: ["dna","genetics"] },
  { id: "sci-13", text: "How does the theory of relativity describe gravity as curved space-time?", category: "Science", difficulty: "advanced", tags: ["relativity","gravity"] },
  { id: "sci-14", text: "Is nuclear fusion power a viable energy source within the next decade?", category: "Science", difficulty: "expert", tags: ["fusion","energy"] },
  { id: "sci-15", text: "How do mRNA vaccines prompt immune responses without using live viruses?", category: "Science", difficulty: "intermediate", tags: ["mrna","vaccines"] },
  { id: "sci-16", text: "Should humanity terraform Mars, or focus exclusively on Earth conservation?", category: "Science", difficulty: "expert", tags: ["mars","terraforming"] },
  { id: "phi-6", text: "What is utilitarianism, and what is its core moral formula?", category: "Philosophy", difficulty: "beginner", tags: ["utilitarianism","ethics"] },
  { id: "phi-7", text: "Explain the difference between rationalism and empiricism.", category: "Philosophy", difficulty: "beginner", tags: ["epistemology","rationalism"] },
  { id: "phi-8", text: "What is stoicism, and how does it separate things in our control from things outside?", category: "Philosophy", difficulty: "intermediate", tags: ["stoicism","control"] },
  { id: "phi-9", text: "How does the concept of nihilism differ from existentialism?", category: "Philosophy", difficulty: "intermediate", tags: ["existentialism","meaning"] },
  { id: "phi-10", text: "What is the ship of Theseus paradox, and what does it say about identity?", category: "Philosophy", difficulty: "advanced", tags: ["identity","paradox"] },
  { id: "phi-11", text: "Explain the difference between deontological ethics and consequentialism.", category: "Philosophy", difficulty: "intermediate", tags: ["deontology","ethics"] },
  { id: "phi-12", text: "What is the simulation hypothesis, and how do philosophers critique it?", category: "Philosophy", difficulty: "advanced", tags: ["simulation","reality"] },
  { id: "phi-13", text: "Can an omnipotent being create a rock so heavy that it cannot lift it? Explain.", category: "Philosophy", difficulty: "expert", tags: ["paradox","omnipotence"] },
  { id: "phi-14", text: "How does the social contract theory justify the authority of the state?", category: "Philosophy", difficulty: "intermediate", tags: ["social contract","state"] },
  { id: "phi-15", text: "Is absolute objective truth attainable, or is all knowledge subjective?", category: "Philosophy", difficulty: "expert", tags: ["epistemology","truth"] },
  { id: "des-6", text: "What is visual hierarchy, and how do designers guide the user's eye?", category: "Design", difficulty: "beginner", tags: ["hierarchy","layouts"] },
  { id: "des-7", text: "Explain the difference between raster graphics and vector graphics.", category: "Design", difficulty: "beginner", tags: ["raster","vector"] },
  { id: "des-8", text: "What is the golden ratio, and how is it used in grid layouts?", category: "Design", difficulty: "intermediate", tags: ["golden ratio","grids"] },
  { id: "des-9", text: "How does skeumorphic design differ from flat design and neomorphism?", category: "Design", difficulty: "intermediate", tags: ["skeuomorphism","flat"] },
  { id: "des-10", text: "What is cognitive load in UX, and what design choices minimize it?", category: "Design", difficulty: "advanced", tags: ["ux","cognitive load"] },
  { id: "des-11", text: "Explain the double diamond design process model.", category: "Design", difficulty: "intermediate", tags: ["process","double diamond"] },
  { id: "des-12", text: "What is mobile-first design, and why is it standard practice?", category: "Design", difficulty: "advanced", tags: ["mobile-first","responsive"] },
  { id: "des-13", text: "Should UI designers prioritize accessibility (a11y) over pure aesthetic choices?", category: "Design", difficulty: "expert", tags: ["a11y","accessibility"] },
  { id: "des-14", text: "How do typography choices establish the brand tone and voice?", category: "Design", difficulty: "intermediate", tags: ["typography","branding"] },
  { id: "des-15", text: "What is dark patterns in UX, and what is the ethical line?", category: "Design", difficulty: "expert", tags: ["dark patterns","ethics"] },
  { id: "ps-6", text: "What is the rule of three, and how does it make speeches memorable?", category: "Public Speaking", difficulty: "beginner", tags: ["rule of three","structure"] },
  { id: "ps-7", text: "Explain how vocal variety (pitch, tone, pace) prevents listener fatigue.", category: "Public Speaking", difficulty: "beginner", tags: ["vocal","delivery"] },
  { id: "ps-8", text: "What is the difference between ethos, pathos, and logos in rhetoric?", category: "Public Speaking", difficulty: "intermediate", tags: ["ethos","rhetoric"] },
  { id: "ps-9", text: "How do you handle Q&A sessions when you don't know the answer?", category: "Public Speaking", difficulty: "intermediate", tags: ["q&a","improvisation"] },
  { id: "ps-10", text: "What is the Monroe Motivated Sequence, and how is it used in pitches?", category: "Public Speaking", difficulty: "advanced", tags: ["structure","monroe"] },
  { id: "ps-11", text: "How do you project confidence using non-verbal body language?", category: "Public Speaking", difficulty: "intermediate", tags: ["body language","delivery"] },
  { id: "ps-12", text: "Explain the concept of 'active pausing' to build tension and focus.", category: "Public Speaking", difficulty: "advanced", tags: ["pauses","focus"] },
  { id: "ps-13", text: "Is storytelling always superior to logical argument in persuasive speaking?", category: "Public Speaking", difficulty: "expert", tags: ["storytelling","persuasion"] },
  { id: "ps-14", text: "How do you conquer stage fright (glossophobia) using biofeedback tricks?", category: "Public Speaking", difficulty: "intermediate", tags: ["stage fright","confidence"] },
  { id: "ps-15", text: "How does rhetoric adapt when speaking to a remote, digital audience?", category: "Public Speaking", difficulty: "expert", tags: ["remote","audience"] },
  { id: "sta-8", text: "What is product-market fit (PMF), and how do you know you have it?", category: "Startups", difficulty: "beginner", tags: ["pmf","traction"] },
  { id: "sta-9", text: "Explain the difference between a pitch deck and a business plan.", category: "Startups", difficulty: "beginner", tags: ["pitch deck","funding"] },
  { id: "sta-10", text: "What is a term sheet, and what are liquidation preferences?", category: "Startups", difficulty: "intermediate", tags: ["term sheet","equity"] },
  { id: "sta-11", text: "How do unit economics determine if a startup can scale profitably?", category: "Startups", difficulty: "intermediate", tags: ["unit economics","metrics"] },
  { id: "sta-12", text: "What is customer acquisition cost (CAC) versus lifetime value (LTV)?", category: "Startups", difficulty: "advanced", tags: ["cac","ltv"] },
  { id: "sta-13", text: "Explain the cold start problem in marketplace platforms.", category: "Startups", difficulty: "intermediate", tags: ["cold start","marketplaces"] },
  { id: "sta-14", text: "What is a safe agreement (SAFE), and how does it differ from convertible debt?", category: "Startups", difficulty: "advanced", tags: ["safe","funding"] },
  { id: "sta-15", text: "Should founders always prioritize rapid scale over profitability? Discuss.", category: "Startups", difficulty: "expert", tags: ["scale","profitability"] },
  { id: "sta-16", text: "How do you calculate startup runway, and when should you raise the next round?", category: "Startups", difficulty: "intermediate", tags: ["runway","cash flow"] },
  { id: "sta-17", text: "What is a capitalization table (cap table), and how does dilution work?", category: "Startups", difficulty: "expert", tags: ["cap table","dilution"] },
  { id: "cul-16", text: "How does subculture split from pop culture and go mainstream?", category: "Culture", difficulty: "beginner", tags: ["subculture","trends"] },
  { id: "cul-17", text: "Explain how memes act as cultural genes that undergo selection.", category: "Culture", difficulty: "beginner", tags: ["memes","evolution"] },
  { id: "cul-18", text: "What is cultural appropriation versus cultural exchange?", category: "Culture", difficulty: "intermediate", tags: ["appropriation","exchange"] },
  { id: "cul-19", text: "How has social media hyper-fragmented the music industry?", category: "Culture", difficulty: "intermediate", tags: ["music","social"] },
  { id: "cul-20", text: "What is the gig economy's impact on communities and neighborhood cohesion?", category: "Culture", difficulty: "advanced", tags: ["gig economy","community"] },
  { id: "cul-21", text: "How does design architecture reflect the cultural values of a city?", category: "Culture", difficulty: "intermediate", tags: ["architecture","society"] },
  { id: "cul-22", text: "What is linguistic drift, and how do online spaces speed up slang evolution?", category: "Culture", difficulty: "advanced", tags: ["linguistics","slang"] },
  { id: "cul-23", text: "Will virtual reality create new digital-only cultural norms and classes?", category: "Culture", difficulty: "expert", tags: ["vr","digital culture"] },
  { id: "cul-24", text: "How do public libraries act as community anchors in the digital age?", category: "Culture", difficulty: "intermediate", tags: ["libraries","social infrastructure"] },
  { id: "cul-25", text: "Should national arts funding prioritize preservation of classics or cutting-edge experimental works?", category: "Culture", difficulty: "expert", tags: ["arts funding","preservation"] },
  { id: "wild-14", text: "If you could witness any event in history first-hand, what would it be and why?", category: "Wildcard", difficulty: "beginner", tags: ["history","fun"] },
  { id: "wild-15", text: "What is your personal definition of a life well lived?", category: "Wildcard", difficulty: "beginner", tags: ["life","reflection"] },
  { id: "wild-16", text: "What would the perfect educational system look like if built from scratch?", category: "Wildcard", difficulty: "intermediate", tags: ["education","system design"] },
  { id: "wild-17", text: "If you had to live in a fictional universe, which one would it be and why?", category: "Wildcard", difficulty: "intermediate", tags: ["fiction","fun"] },
  { id: "wild-18", text: "What is a book, film, or piece of art that permanently altered your perspective?", category: "Wildcard", difficulty: "intermediate", tags: ["art","impact"] },
  { id: "wild-19", text: "What is the most elegant mathematical proof or formula you've encountered?", category: "Wildcard", difficulty: "advanced", tags: ["math","elegance"] },
  { id: "wild-20", text: "How do you stay focused and protect your attention in a hyper-distracted world?", category: "Wildcard", difficulty: "intermediate", tags: ["attention","focus"] },
  { id: "wild-21", text: "If you could have a conversation with any philosopher or scientist, what would you ask them?", category: "Wildcard", difficulty: "beginner", tags: ["conversation","learning"] },
  { id: "wild-22", text: "Explain a concept from game design that could make physical chore tasks fun.", category: "Wildcard", difficulty: "advanced", tags: ["gamification","design"] },
  { id: "wild-23", text: "What is the ultimate bottleneck to human civilization over the next century?", category: "Wildcard", difficulty: "expert", tags: ["civilization","future"] },
  { id: "med-1", text: "How do mRNA vaccines instruct cells to build defenses, and what is their future?", category: "Medicine", difficulty: "beginner", tags: ["mrna","vaccines"] },
  { id: "med-2", text: "Explain the mechanism of CRISPR gene editing and its current clinical limitations.", category: "Medicine", difficulty: "intermediate", tags: ["crispr","gene editing"] },
  { id: "med-3", text: "Should AI-driven diagnostic tools be allowed to operate without doctor supervision?", category: "Medicine", difficulty: "advanced", tags: ["ai","diagnostics"] },
  { id: "med-4", text: "What is the biological basis of the gut-brain axis, and how does gut microbiota affect mood?", category: "Medicine", difficulty: "intermediate", tags: ["gut-brain","microbiome"] },
  { id: "med-5", text: "Explain how antibiotic resistance occurs and propose a global strategy to combat it.", category: "Medicine", difficulty: "advanced", tags: ["antibiotics","resistance"] },
  { id: "med-6", text: "Should healthcare systems prioritize preventative medicine over acute care funding?", category: "Medicine", difficulty: "expert", tags: ["preventative","policy"] },
  { id: "med-7", text: "What is immunotherapy, and how does it train the immune system to target cancer cells?", category: "Medicine", difficulty: "intermediate", tags: ["immunotherapy","cancer"] },
  { id: "med-8", text: "Is it ethical to use CRISPR to edit human germline cells to prevent hereditary disease?", category: "Medicine", difficulty: "expert", tags: ["ethics","germline"] },
  { id: "med-9", text: "How does chronic sleep deprivation affect cellular repair mechanisms in the human body?", category: "Medicine", difficulty: "beginner", tags: ["sleep","biology"] },
  { id: "med-10", text: "Detail how telemedicine will transform rural healthcare access globally.", category: "Medicine", difficulty: "beginner", tags: ["telemedicine","rural"] },
  { id: "pf-1", text: "What is the 50/30/20 budgeting rule, and why does it work for beginners?", category: "Personal Finance", difficulty: "beginner", tags: ["budgeting","savings"] },
  { id: "pf-2", text: "Explain the difference between a traditional IRA and a Roth IRA.", category: "Personal Finance", difficulty: "beginner", tags: ["ira","retirement"] },
  { id: "pf-3", text: "How does the 'debt avalanche' method differ from the 'debt snowball' method?", category: "Personal Finance", difficulty: "intermediate", tags: ["debt","payoff"] },
  { id: "pf-4", text: "Is renting always a financial loss compared to buying a home? Defend a position.", category: "Personal Finance", difficulty: "advanced", tags: ["renting","buying"] },
  { id: "pf-5", text: "What are index funds, and why do most retail investors underperform them?", category: "Personal Finance", difficulty: "beginner", tags: ["index funds","investing"] },
  { id: "pf-6", text: "Explain how compound interest acts as a double-edged sword when dealing with credit card debt.", category: "Personal Finance", difficulty: "intermediate", tags: ["compound interest","debt"] },
  { id: "pf-7", text: "What is tax-loss harvesting, and how can individual investors use it?", category: "Personal Finance", difficulty: "advanced", tags: ["taxes","investing"] },
  { id: "pf-8", text: "How much should someone save in an emergency fund, and where should they keep it?", category: "Personal Finance", difficulty: "beginner", tags: ["emergency fund","liquidity"] },
  { id: "pf-9", text: "Should personal finance be a mandatory high school graduation requirement? Argue a side.", category: "Personal Finance", difficulty: "intermediate", tags: ["education","finance"] },
  { id: "pf-10", text: "What is FIRE (Financial Independence, Retire Early), and is it realistic for the average earner?", category: "Personal Finance", difficulty: "expert", tags: ["fire","retirement"] },
];


export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced", "expert"];

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: "#22c55e",
  intermediate: "#3b82f6",
  advanced: "#f59e0b",
  expert: "#ef4444",
};

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  beginner: 100,
  intermediate: 150,
  advanced: 200,
  expert: 300,
};

export function getTopicsByCategory(category: string): Topic[] {
  return TOPIC_BANK.filter((t) => t.category === category);
}

export function getRandomTopic(categories?: string[], difficulty?: Difficulty): Topic | null {
  let pool = TOPIC_BANK;
  if (categories && categories.length > 0) {
    pool = pool.filter((t) => categories.includes(t.category));
  }
  if (difficulty) {
    pool = pool.filter((t) => t.difficulty === difficulty);
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}