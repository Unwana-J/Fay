import { type PodiumTopic } from "@/lib/podium-types";

export const PODIUM_TOPICS: PodiumTopic[] = [
  // 🔥 Hot Take (10 topics)
  {
    id: "ht-1",
    text: "The System Needs Poor People to Function",
    subtitle: "An Unhinged Hot Take",
    category: "Economics",
    vibe: "🔥 Hot Take",
    seedBullets: ["Capitalism requires a bottom rung", "Poverty is a feature, not a bug", "Who would do the $10/hr jobs?"]
  },
  {
    id: "ht-2",
    text: "Hustle Culture is a Scam Designed by People Who Already Have Money",
    subtitle: "A Financial Exposé",
    category: "Economics",
    vibe: "🔥 Hot Take",
    seedBullets: ["Gary Vee has a net worth of $200M", "Rest is productive", "The 40-hour week was invented by unions, not grinders"]
  },
  {
    id: "ht-3",
    text: "Democracy is Just Mob Rule with Better Branding",
    subtitle: "Political Science, Allegedly",
    category: "Politics",
    vibe: "🔥 Hot Take",
    seedBullets: ["51% can oppress 49%", "Most voters don't know the candidates' policies", "Marketing determines elections"]
  },
  {
    id: "ht-4",
    text: "Social Media Has Made Us All Narcissists and We Are Okay With It",
    subtitle: "A Mirror Moment",
    category: "Psychology",
    vibe: "🔥 Hot Take",
    seedBullets: ["Curated highlight reels as identity", "Selfie culture normalisation", "Engagement = dopamine = addiction"]
  },
  {
    id: "ht-5",
    text: "Remote Work Exposed How Many Jobs Are Completely Pointless",
    subtitle: "Bullshit Jobs: A Vindication",
    category: "Work",
    vibe: "🔥 Hot Take",
    seedBullets: ["David Graeber was right", "Zoom meetings that could have been emails", "Productivity didn't collapse"]
  },
  {
    id: "ht-6",
    text: "Marriage Was Invented as a Property Transfer Mechanism",
    subtitle: "Romance is a Social Construct",
    category: "Relationships",
    vibe: "🔥 Hot Take",
    seedBullets: ["Dowry, bride price — follow the money", "Love marriages are historically recent", "The wedding industry is $70B/year"]
  },
  {
    id: "ht-7",
    text: "University Degrees Are the World's Most Expensive Participation Trophies",
    subtitle: "A £50,000 Opinion",
    category: "Education",
    vibe: "🔥 Hot Take",
    seedBullets: ["Credential inflation", "Most jobs don't use the degree subject", "YouTube exists"]
  },
  {
    id: "ht-8",
    text: "Breakfast is a Lie Sold to You by Cereal Companies",
    subtitle: "Big Breakfast Exposed",
    category: "Health",
    vibe: "🔥 Hot Take",
    seedBullets: ["Kellogs funded 'breakfast is the most important meal' research", "Intermittent fasting", "What did humans eat before cereal?"]
  },
  {
    id: "ht-9",
    text: "Most People Who Say They Love Reading Have Not Finished a Book This Year",
    subtitle: "A Literary Audit",
    category: "Culture",
    vibe: "🔥 Hot Take",
    seedBullets: ["Reading as personality trait", "Goodreads cheating", "BookTok vs actual reading"]
  },
  {
    id: "ht-10",
    text: "Charity is Just Rich People's Guilt in Tax-Deductible Form",
    subtitle: "Philanthropy, Deconstructed",
    category: "Economics",
    vibe: "🔥 Hot Take",
    seedBullets: ["Donor-named buildings", "Oxfam scandals", "Why not just pay more taxes?"]
  },
  // 🇳🇬 Culture (10 topics)
  {
    id: "cu-1",
    text: "Nigerians Don't Like Enjoyment. We Like Evidence of Enjoyment.",
    subtitle: "A Cultural Audit",
    category: "Culture",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Instagram at the party", "The Owambe photo wall", "'If it's not on your story, did it happen?'"]
  },
  {
    id: "cu-2",
    text: "Owambe Is the Peak of Human Social Engineering",
    subtitle: "Anthropological Findings",
    category: "Culture",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Aso-ebi as social currency", "Jollof rice as political statement", "The DJ controls the room's entire mood"]
  },
  {
    id: "cu-3",
    text: "Nigerian Parents Raised Therapists, Not Children",
    subtitle: "A Generational Study",
    category: "Family",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Emotional parentification", "'Bring your problems to God'", "First-gen immigrant childhood"]
  },
  {
    id: "cu-4",
    text: "Jollof Wars Are Diplomatic Relations by Other Means",
    subtitle: "A Geopolitical Analysis",
    category: "Food",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Ghana vs Nigeria annual summit", "The smoky party jollof argument", "Senegal is being deliberately ignored"]
  },
  {
    id: "cu-5",
    text: "Every Nigerian Family Has One Person Who Joined a Suspicious Church",
    subtitle: "A Sociological Survey",
    category: "Culture",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Prosperity gospel economics", "The 'uncle who gives prophecies'", "Mountain of Fire attendance rates"]
  },
  {
    id: "cu-6",
    text: "Afrobeats Is the Most Successful Nigerian Export and We Need to Discuss the Royalties",
    subtitle: "A Music Industry Audit",
    category: "Music",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Burna Boy at Coachella", "Streaming economics", "Who benefits when culture goes global?"]
  },
  {
    id: "cu-7",
    text: "The Naira Rate is the Real National Conversation",
    subtitle: "Economic Anthropology",
    category: "Economics",
    vibe: "🇳🇬 Culture",
    seedBullets: ["WhatsApp exchange rate groups", "Dollar account culture", "Parallel market as shadow government"]
  },
  {
    id: "cu-8",
    text: "Nigerian Customer Service is a Spiritual Test",
    subtitle: "A Consumer Experience Study",
    category: "Business",
    vibe: "🇳🇬 Culture",
    seedBullets: ["PHCN/NEPA as a life teacher", "Bank queue as philosophical training", "'We are looking into it'"]
  },
  {
    id: "cu-9",
    text: "Every Nigerian Wedding is a Networking Event Disguised as a Ceremony",
    subtitle: "A Social Capital Report",
    category: "Culture",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Business cards at reception", "The 'family friend' economy", "Aso-ebi group chats double as LinkedIn"]
  },
  {
    id: "cu-10",
    text: "Nollywood Has Better Life Lessons Than Harvard Business School",
    subtitle: "Curriculum Review",
    category: "Education",
    vibe: "🇳🇬 Culture",
    seedBullets: ["Enemy within the household", "The 'village people' risk management framework", "Rise-and-fall narratives"]
  },
  // 💅 Social (10 topics)
  {
    id: "so-1",
    text: "Is This a Safe Space? (5 Opinions That Will Get Me Cancelled)",
    subtitle: "An Exposé",
    category: "Social",
    vibe: "💅 Social",
    seedBullets: ["Cancel culture and nuance", "Hot takes vs harmful takes", "The courage to be wrong publicly"]
  },
  {
    id: "so-2",
    text: "Red Flags We All Ignore On Purpose Because They're Green to Us",
    subtitle: "A Relationship Autopsy",
    category: "Relationships",
    vibe: "💅 Social",
    seedBullets: ["Attachment styles", "The 'I'll fix them' delusion", "Love bombing as flattery"]
  },
  {
    id: "so-3",
    text: "Situationships Are Just Relationships for People Who Failed Negotiations",
    subtitle: "A Contract Law Perspective",
    category: "Relationships",
    vibe: "💅 Social",
    seedBullets: ["Ambiguity as a dating strategy", "Who benefits from undefined terms?", "The DTR conversation as a power move"]
  },
  {
    id: "so-4",
    text: "Girl Dinner is Just Men's Eating Habits With Better Marketing",
    subtitle: "Gender Studies, Applied",
    category: "Social",
    vibe: "💅 Social",
    seedBullets: ["Cheese and crackers for dinner", "The aestheticisation of laziness", "TikTok as a rebranding machine"]
  },
  {
    id: "so-5",
    text: "We Are All the Main Character of Our Own Delusion",
    subtitle: "Cognitive Bias, Explored",
    category: "Psychology",
    vibe: "💅 Social",
    seedBullets: ["Illusory superiority", "Main character energy", "Everyone thinks they drive above average"]
  },
  {
    id: "so-6",
    text: "The 'I'm Not Like Other Girls' Girl Is Every Girl at Some Point",
    subtitle: "A Longitudinal Study",
    category: "Social",
    vibe: "💅 Social",
    seedBullets: ["Internalised misogyny", "The cool girl trope", "Growth arcs in popular culture"]
  },
  {
    id: "so-7",
    text: "Ghosting is Just Conflict Avoidance With an Audience",
    subtitle: "Communication Pathology Report",
    category: "Relationships",
    vibe: "💅 Social",
    seedBullets: ["Digital age cowardice", "Why closure is not their responsibility", "The economics of emotional labour"]
  },
  {
    id: "so-8",
    text: "Every Group Chat Has a Villain and You Should Check If It's You",
    subtitle: "A Group Dynamics Study",
    category: "Social",
    vibe: "💅 Social",
    seedBullets: ["Left on read as power play", "Screenshot culture", "The double-standards of group etiquette"]
  },
  {
    id: "so-9",
    text: "Trauma Bonding is Just Friendship With Extra Steps",
    subtitle: "A Therapeutic Reframe",
    category: "Psychology",
    vibe: "💅 Social",
    seedBullets: ["Shared hardship as social glue", "War veterans and university friends", "Are all close friendships trauma bonds?"]
  },
  {
    id: "so-10",
    text: "The 'I'm Just Being Honest' Person Is Never Actually Honest About Themselves",
    subtitle: "A Hypocrisy Audit",
    category: "Social",
    vibe: "💅 Social",
    seedBullets: ["Radical honesty as aggression", "Brutal honesty as a shield", "Vulnerability vs criticism"]
  },
  // 🧠 Pseudo-Science (10 topics)
  {
    id: "ps-1",
    text: "Introverts Are Just Extroverts Who Ran Out of Social Battery",
    subtitle: "Personality Science, Reviewed",
    category: "Psychology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["MBTI validity questioned", "Context-dependant sociability", "Ambivert is everyone"]
  },
  {
    id: "ps-2",
    text: "Morning People Don't Actually Exist Before 10am",
    subtitle: "Circadian Rhythm Revisionism",
    category: "Health",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Chronotype is genetic", "Coffee is the real morning person", "5am club is capitalist propaganda"]
  },
  {
    id: "ps-3",
    text: "The Myers-Briggs Personality Test Is Astrology for People Who Own Laptops",
    subtitle: "A Psychometric Critique",
    category: "Psychology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Test-retest reliability problems", "Forer effect", "INTJ superiority complex"]
  },
  {
    id: "ps-4",
    text: "Manifesting Is Just Goal-Setting for People Who Are Afraid of Failure",
    subtitle: "Law of Attraction, Audited",
    category: "Psychology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Confirmation bias in manifestation", "Vision boards = planning", "Accountability without the action"]
  },
  {
    id: "ps-5",
    text: "We Are All Mildly Addicted to Our Phones and No One Wants to Admit It",
    subtitle: "A Digital Dependency Study",
    category: "Technology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Variable reward schedules", "Average screen time statistics", "Phone anxiety when battery hits 10%"]
  },
  {
    id: "ps-6",
    text: "The Five Love Languages Are Just Unprocessed Childhood Needs",
    subtitle: "An Attachment Theory Remix",
    category: "Psychology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Gift-giving as lack", "Words of affirmation as validation seeking", "Dr Gary Chapman's motivations"]
  },
  {
    id: "ps-7",
    text: "Retrograde Mercury is a Better Explanation Than Human Error",
    subtitle: "Astrology as Accountability",
    category: "Astrology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Blame shifting mechanics", "Cosmic responsibility avoidance", "When Mercury isn't retrograde and things still go wrong"]
  },
  {
    id: "ps-8",
    text: "We Are Living in a Simulation and the Lag Proves It",
    subtitle: "Technical Support Ticket",
    category: "Philosophy",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Nick Bostrom's argument", "Déjà vu as cache reload", "Why would the simulators pick Earth?"]
  },
  {
    id: "ps-9",
    text: "Birth Order Theory Would Explain a Lot If You Let It",
    subtitle: "A Family Systems Reboot",
    category: "Psychology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["First-borns as natural enforcers", "Middle child diplomacy", "Last-borns and why they're the funniest"]
  },
  {
    id: "ps-10",
    text: "Everyone Thinks They Are a Better Driver Than They Actually Are",
    subtitle: "The Dunning-Kruger Highway",
    category: "Psychology",
    vibe: "🧠 Pseudo-Science",
    seedBullets: ["Illusory superiority data", "Accident rates vs self-assessment", "Road rage as expert indignation"]
  },
  // 💰 Economics (10 topics)
  {
    id: "ec-1",
    text: "Broke People Have the Best Fashion Sense",
    subtitle: "A Sartorial Economy Study",
    category: "Fashion",
    vibe: "💰 Economics",
    seedBullets: ["Thrift store aesthetics", "Creativity born from constraint", "Hypebeast vs actual style"]
  },
  {
    id: "ec-2",
    text: "Why Expensive Restaurants Serve Small Portions",
    subtitle: "A Plate Economics Seminar",
    category: "Food",
    vibe: "💰 Economics",
    seedBullets: ["Scarcity as luxury signalling", "Michelin stars and expectations", "The 'artistic' justification"]
  },
  {
    id: "ec-3",
    text: "The Gig Economy is Just Feudalism With an App",
    subtitle: "Labour History, Updated",
    category: "Economics",
    vibe: "💰 Economics",
    seedBullets: ["Lords and serfs vs platforms and gig workers", "No employment rights", "5-star rating as tithe"]
  },
  {
    id: "ec-4",
    text: "Avocado Toast Did Not Stop Anyone Buying a House",
    subtitle: "A Housing Market Defence",
    category: "Economics",
    vibe: "💰 Economics",
    seedBullets: ["Median house price vs average salary ratio 2000-2024", "Where Bernard Salt got it wrong", "Interest rates vs smashed avo"]
  },
  {
    id: "ec-5",
    text: "NFTs Were a Perfectly Legal Way to Run a Ponzi Scheme",
    subtitle: "Web3 Autopsy",
    category: "Technology",
    vibe: "💰 Economics",
    seedBullets: ["Greater fool theory", "Celebrity endorsement liability", "The JPEG you can screenshot"]
  },
  {
    id: "ec-6",
    text: "Airlines Price Their Tickets Using Emotional Blackmail and Algorithms",
    subtitle: "A Consumer Rights Report",
    category: "Business",
    vibe: "💰 Economics",
    seedBullets: ["Dynamic pricing mechanics", "Incognito mode myth", "Basic economy as psychological warfare"]
  },
  {
    id: "ec-7",
    text: "The Wellness Industry Sells You Solutions to Problems It Created",
    subtitle: "Health Market Analysis",
    category: "Health",
    vibe: "💰 Economics",
    seedBullets: ["$4.5 trillion industry size", "Anxiety content funnel", "Selling the cure and the disease"]
  },
  {
    id: "ec-8",
    text: "Crypto Twitter is Just Financial Astrology for Men Aged 18-35",
    subtitle: "A Market Behaviour Study",
    category: "Technology",
    vibe: "💰 Economics",
    seedBullets: ["Moon predictions", "Chart reading as vibes", "The 'HODL' religion"]
  },
  {
    id: "ec-9",
    text: "Subscription Services Are Just Borrowing Things You Already Own",
    subtitle: "Ownership in the Digital Age",
    category: "Technology",
    vibe: "💰 Economics",
    seedBullets: ["Netflix removing content you paid for", "Adobe CC hostage situation", "Cloud vs local storage"]
  },
  {
    id: "ec-10",
    text: "The Side Hustle Culture is Making Everyone Mediocre at Two Things",
    subtitle: "A Productivity Tragedy",
    category: "Work",
    vibe: "💰 Economics",
    seedBullets: ["Jack of all trades, broke at both", "Time as a finite resource", "Deep work vs income diversification"]
  },
  // 🎭 Pop Culture (10 topics)
  {
    id: "pc-1",
    text: "Marvel Peaked with Infinity War and Everything Since Has Been Fan Fiction",
    subtitle: "A Cinematic Universe Autopsy",
    category: "Entertainment",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Multiverse fatigue", "Character death stakes", "The Endgame conclusion problem"]
  },
  {
    id: "pc-2",
    text: "Reality TV is Scripted and That's Why It Works",
    subtitle: "Behind the Fourth Wall",
    category: "Entertainment",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Producer manipulation", "Casting archetypes", "Why 'genuine' reality flopped"]
  },
  {
    id: "pc-3",
    text: "Beyoncé's PR Team is the Most Powerful Institution in the Western World",
    subtitle: "A Media Power Analysis",
    category: "Music",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Surprise album drops", "The no-interview strategy", "Cultural silence as power"]
  },
  {
    id: "pc-4",
    text: "We Root for Villains Because They Have Better Motivations Than Heroes",
    subtitle: "A Narrative Theory",
    category: "Entertainment",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Walter White sympathy arc", "Killmonger was right", "Hero privilege in storytelling"]
  },
  {
    id: "pc-5",
    text: "TikTok Has the Attention Span of a Goldfish and So Do We Now",
    subtitle: "A Neuroscience Warning",
    category: "Technology",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Average video length decline", "Dopamine loop mechanics", "Long-form content extinction"]
  },
  {
    id: "pc-6",
    text: "Drake vs Kendrick Was the Most Important Cultural Event of 2024",
    subtitle: "A Musicological Verdict",
    category: "Music",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Rap beef as public trial", "Not Like Us as career-ending evidence", "Social media as jury"]
  },
  {
    id: "pc-7",
    text: "Nostalgia is the Entertainment Industry's Biggest Crutch",
    subtitle: "IP Strategy, Diagnosed",
    category: "Entertainment",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Disney live-action factory", "Sequel culture", "Original IP financial risk"]
  },
  {
    id: "pc-8",
    text: "K-Pop Has Cracked the Code for Fan Cult Building and That's Concerning",
    subtitle: "A Parasocial Study",
    category: "Music",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Fan light stick purchases", "Album packaging as collectibles", "Idol parasocial relationships"]
  },
  {
    id: "pc-9",
    text: "Podcasts Are Just Radio for People Who Think They're Too Smart for Radio",
    subtitle: "A Medium Analysis",
    category: "Media",
    vibe: "🎭 Pop Culture",
    seedBullets: ["Joe Rogan phenomenon", "Podcast listener demographics", "Why everyone thinks they should start one"]
  },
  {
    id: "pc-10",
    text: "Social Media Influencers Are Just Salespeople We Chose to Follow",
    subtitle: "Attention Economy, Demystified",
    category: "Technology",
    vibe: "🎭 Pop Culture",
    seedBullets: ["#ad as the new commercial", "Trust vs reach trade-off", "Authenticity as a product"]
  }
];

export const PODIUM_VIBES = [
  "🔥 Hot Take",
  "🇳🇬 Culture",
  "💅 Social",
  "🧠 Pseudo-Science",
  "💰 Economics",
  "🎭 Pop Culture",
] as const;

export function getRandomTopic(exclude?: string[]): PodiumTopic {
  const available = exclude?.length
    ? PODIUM_TOPICS.filter((t) => !exclude.includes(t.id))
    : PODIUM_TOPICS;
  return available[Math.floor(Math.random() * available.length)];
}

export function getTopicsByVibe(vibe: string): PodiumTopic[] {
  return PODIUM_TOPICS.filter((t) => t.vibe === vibe);
}
