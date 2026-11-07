/**
 * MindMarket Benchmark Datasets & Mock Store
 * Fully realistic, traceable ground-truth data adhering to Ventriloc standards.
 */

export const BENCHMARK_CAMPAIGN = {
  id: "demo-1",
  brandName: "AuraSound",
  productName: "AuraWave Pro ANC Headphones",
  category: "Consumer Electronics",
  objective: "Direct Conversions",
  targetAudience: "Commuters, remote software engineers, and frequent flyers aged 22-45 seeking premium active noise cancellation without $400 markup.",
  headline: "Silence The World. Hear Only What Matters.",
  bodyText: "Experience 99.4% ambient noise isolation with custom acoustic chambers and ultra-plush memory foam. 45-hour quick-charge battery keeps you immersed all week. Now $149 with free express shipping.",
  callToAction: "Shop Now — Limited First Batch",
  image: "assets/images/aurawave-pro.svg",
  reviewsFile: "aurawave_48_customer_reviews.csv",
  reviewCount: 48,
  groundingConfidence: 92,
  groundingStatus: "48 Reviews Analyzed",
  liveApiEnriched: true,
  overallScore: 58,
  riskLevel: "high", // "high" | "moderate" | "scale"
  riskLabel: "High Conversion Risk",
  createdAt: "2026-11-06T14:22:00Z",

  // Aggregate Metrics (0 - 10)
  metrics: {
    attention: 8.2,
    clarity: 7.4,
    credibility: 4.1,
    purchaseIntent: 4.6,
  },

  // State 1: Pipeline Stepper Stages
  pipelineStages: [
    {
      id: "vision-ocr",
      title: "Visual hierarchy & OCR claim extraction",
      description: "Extracted: '99.4% Ambient Isolation', '$149 Price Anchor', Minimalist matte hardware aesthetic.",
      status: "done",
      duration: "0.8s"
    },
    {
      id: "dataset-ingest",
      title: "Customer review dataset ingestion & friction clustering",
      description: "Ingested 48 verified customer reviews. Identified 3 primary friction clusters: clamp pressure (31%), ANC rumble (29%), customer service (17%).",
      status: "done",
      duration: "1.2s"
    },
    {
      id: "persona-eval",
      title: "Simulating 5 parallel autonomous consumer persona evaluations",
      description: "Evaluated objections across Skeptic, Impulsive, Bargain, Quality, and Rational personas.",
      status: "done",
      duration: "1.4s"
    },
    {
      id: "evidence-crossref",
      title: "Cross-referencing persona hypotheses against real review evidence",
      description: "Correlated 12 synthetic objections directly against verified customer complaint clusters (92% grounding score).",
      status: "done",
      duration: "0.9s"
    },
    {
      id: "executive-synthesis",
      title: "Synthesizing executive report & testable A/B variations",
      description: "Generated 3 prioritized action cards with explicit hypotheses and copy prescriptions.",
      status: "done",
      duration: "0.6s"
    }
  ],

  // TAB 1: Executive Diagnosis
  executiveDiagnosis: {
    summary: "The creative achieves strong visual attention (8.2/10) through stark contrast and clean industrial design, but suffers catastrophic credibility drop-off (4.1/10). The headline's extreme technical claim ('99.4% ambient isolation') provokes immediate defense mechanisms among analytical buyers, while complete omission of warranty or trial terms kills purchase intent for an unfamiliar DTC hardware brand.",
    primaryFrictions: [
      "Unsubstantiated '99.4%' isolation claim triggers spam/exaggeration red flags across 4 of 5 personas.",
      "Zero explicit warranty, trial duration, or return shipping guarantee leaves high perceived financial risk at $149.",
      "Real reviews heavily cite temple/glasses clamp pressure after 2+ hours, yet ad claims 'ultra-plush comfort' without ergonomic specifics."
    ],
    actionCards: [
      {
        id: "action-1",
        priority: "CRITICAL",
        problemStatement: "Unverified '99.4% Ambient Isolation' claim. Persona Skeptic and Rational Buyer perceive this as dropshipped marketing hyperbole with no ISO or lab accreditation.",
        evidenceCitation: "Amazon Review #14: '99.4% is total fantasy. On the subway train it struggles noticeably on the low screeching rails.'",
        recommendedCopy: {
          headline: "Studio Silence, Anywhere. Tested Against Jet Engine Drone.",
          body: "Bespoke dual-diaphragm ANC tuned specifically for flight hum and open office chatter. 45-hour battery life. Try at home for 30 days.",
          cta: "Claim 30-Day Risk-Free Trial"
        },
        hypothesis: "Replacing arbitrary percentage metrics with specific acoustic scenarios will increase Credibility from 4.1 → 7.0 and decrease blended CPA by ~25%."
      },
      {
        id: "action-2",
        priority: "HIGH",
        problemStatement: "Friction around unknown brand legitimacy and return risk at the $149 price barrier. The Bargain Hunter and Rational Buyer refuse checkout without risk-reversal.",
        evidenceCitation: "Reddit r/headphones: 'Ordered from AuraSound last month. Sound was decent but return process was completely opaque on their landing page.'",
        recommendedCopy: {
          headline: "World-Class Noise Cancellation. Zero Buyer's Remorse.",
          body: "Engineered with memory foam comfort rings. If they don't outperform your old headphones within 30 days, send them back for a 100% refund — free return shipping included.",
          cta: "Test Drive for 30 Days"
        },
        hypothesis: "Prominently communicating the 30-day money-back guarantee in the primary CTA will lift landing page checkout completion by 18%."
      },
      {
        id: "action-3",
        priority: "MEDIUM",
        problemStatement: "Clamp force & glasses fatigue unaddressed. 15 of 48 real customer reviews cited uncomfortable pressure around the temples during extended work sessions.",
        evidenceCitation: "Trustpilot: 'Great battery, but if you wear glasses like me, after two hours your ears will ache.'",
        recommendedCopy: {
          headline: "Engineered For 8-Hour Workdays. Even With Glasses.",
          body: "Low-tension memory foam cushions disperse clamp pressure evenly across the skull. Featherlight 230g architecture for zero-fatigue listening.",
          cta: "Explore Ergonomic Specs"
        },
        hypothesis: "Calling out eyeglasses compatibility directly reduces post-purchase return rates by an estimated 14% based on historical category returns."
      }
    ]
  },

  // TAB 2: Synthetic Focus Group (5 Personas)
  personas: [
    {
      id: "skeptic",
      name: "The Skeptic",
      avatarInitials: "SK",
      roleBadge: "High Resistance",
      behaviorSummary: "Hyper-vigilant towards dropshipping hallmarks, false technical percentages, and lack of verified contact addresses.",
      scores: {
        attention: 8,
        clarity: 7,
        credibility: 2,
        purchaseIntent: 2
      },
      gutReaction: "Where did '99.4%' come from? What lab tested that? Sounds like another Shenzhen white-label headset with a sleek Shopify landing page.",
      unansweredObjections: [
        "No frequency response curve or decibel attenuation chart provided.",
        "Missing audio codecs (LDAC, aptX HD, or basic AAC?).",
        "Who pays return shipping if the ANC has a constant background hiss?"
      ],
      dealbreaker: "Unverified acoustic isolation claims paired with an unfamiliar brand name and no third-party verification."
    },
    {
      id: "impulsive",
      name: "The Impulsive Buyer",
      avatarInitials: "IP",
      roleBadge: "Hooked but Hesitant",
      behaviorSummary: "Responsive to aesthetic minimalism, clean silhouette imagery, and the allure of premium tech under $200.",
      scores: {
        attention: 9,
        clarity: 8,
        credibility: 6,
        purchaseIntent: 6
      },
      gutReaction: "The industrial design looks super sleek, and $149 is way more approachable than dropping $400 on Sony WH-1000XM5s.",
      unansweredObjections: [
        "Does it arrive by Friday if I order right now?",
        "Is the hardshell travel case included or an upsell at checkout?",
        "Does it come in matte silver or just black?"
      ],
      dealbreaker: "Lack of immediate shipping clarity and unexpected accessory add-ons in the cart."
    },
    {
      id: "bargain",
      name: "The Bargain Hunter",
      avatarInitials: "BH",
      roleBadge: "Price-to-Spec Sensitive",
      behaviorSummary: "Constantly benchmarks against established budget champions (Anker Soundcore Q45, 1More Sonoflow).",
      scores: {
        attention: 7,
        clarity: 8,
        credibility: 5,
        purchaseIntent: 4
      },
      gutReaction: "$149 is okay, but Anker Soundcore Q45 is $119 and has proven ANC with hundreds of YouTube teardowns. Why should I risk $30 more?",
      unansweredObjections: [
        "Is there an introductory promo code or student discount?",
        "Are replacement ear cushions affordable or proprietary?",
        "What is the warranty period — 1 year or 90 days?"
      ],
      dealbreaker: "Absence of a tangible price advantage or launch bundle discount against Anker/Sony."
    },
    {
      id: "quality",
      name: "The Quality-Oriented Buyer",
      avatarInitials: "QO",
      roleBadge: "Spec & Durability Inspector",
      behaviorSummary: "Focuses on headband slider materials, driver diaphragm composition, and long-term cushion fatigue.",
      scores: {
        attention: 8,
        clarity: 6,
        credibility: 4,
        purchaseIntent: 4
      },
      gutReaction: "45-hour battery is respectable, but what material is the headband slider? Plastic hinge mechanisms snap within 8 months of commuter use.",
      unansweredObjections: [
        "Are the hinges reinforced aluminum or injection-molded ABS?",
        "Can the battery be replaced or does the unit become e-waste when cells degrade?",
        "What type of memory foam is used in the earcups?"
      ],
      dealbreaker: "Zero technical disclosure on mechanical stress points and hinge construction."
    },
    {
      id: "rational",
      name: "The Rational Buyer",
      avatarInitials: "RB",
      roleBadge: "Pragmatic Utility Evaluator",
      behaviorSummary: "Weighs daily workflow utility: multipoint Bluetooth pairing, microphone clarity in busy rooms, and seamless returns.",
      scores: {
        attention: 7,
        clarity: 7,
        credibility: 5,
        purchaseIntent: 5
      },
      gutReaction: "Can I stay connected to both my MacBook for Zoom and iPhone for calls simultaneously? If the mic picks up all keyboard typing, it's useless for remote work.",
      unansweredObjections: [
        "Multipoint Bluetooth 5.3 support is unconfirmed.",
        "No microphone sample or background voice isolation demo.",
        "Return window is not stated anywhere on the creative."
      ],
      dealbreaker: "Unclear multipoint Bluetooth pairing and absence of a clear return policy window."
    }
  ],

  // TAB 3: Real Evidence Explorer
  evidenceStats: {
    totalReviews: 48,
    sentiment: {
      negative: 31, // %
      neutral: 48,  // %
      positive: 21   // %
    },
    topFrictionClusters: [
      { topic: "Headband clamp pressure on temples", count: 15, percentage: 31 },
      { topic: "Low-frequency rumble / subway screech ANC leak", count: 14, percentage: 29 },
      { topic: "Microphone picks up ambient room echo", count: 8, percentage: 17 },
      { topic: "Return shipping confusion & slow support", count: 6, percentage: 13 }
    ]
  },

  evidenceItems: [
    {
      id: "ev-1",
      source: "Amazon Verified Purchase",
      rating: 2,
      sentiment: "Negative",
      excerpt: "The claim of 99% noise cancellation is marketing fiction. On my daily commute on the Chicago Blue Line, the low rumble of the train cuts right through the earcups.",
      validationStatus: "Supported by real evidence",
      tiedPersona: "The Skeptic",
      date: "2026-10-18"
    },
    {
      id: "ev-2",
      source: "Reddit r/headphones",
      rating: 3,
      sentiment: "Negative",
      excerpt: "Solid audio tuning for $150, but the clamp force is relentless if you wear glasses. After two 45-minute meetings, my ear cartilage was throbbing.",
      validationStatus: "Supported by real evidence",
      tiedPersona: "The Quality-Oriented Buyer",
      date: "2026-10-24"
    },
    {
      id: "ev-3",
      source: "Trustpilot",
      rating: 2,
      sentiment: "Negative",
      excerpt: "Decent headphones, but trying to return them during their 'trial period' was a headache. Took 5 days for support to send an RMA slip and they deducted $18 return freight.",
      validationStatus: "Supported by real evidence",
      tiedPersona: "The Rational Buyer",
      date: "2026-10-29"
    },
    {
      id: "ev-4",
      source: "Amazon Verified Purchase",
      rating: 3,
      sentiment: "Neutral",
      excerpt: "Battery life legitimately lasted four days of office work without charging. Build feels light, maybe a little too plasticky near the folding hinges.",
      validationStatus: "Partially supported",
      tiedPersona: "The Quality-Oriented Buyer",
      date: "2026-11-01"
    },
    {
      id: "ev-5",
      source: "Reddit r/BuyItForLife",
      rating: 2,
      sentiment: "Negative",
      excerpt: "Why buy this over the Soundcore Q45 when Anker has 3-year warranty options and you can get pads replaced for ten bucks? AuraSound won't even sell spare ear cushions.",
      validationStatus: "Supported by real evidence",
      tiedPersona: "The Bargain Hunter",
      date: "2026-11-03"
    },
    {
      id: "ev-6",
      source: "Trustpilot",
      rating: 4,
      sentiment: "Positive",
      excerpt: "Looks gorgeous on my desk. Looks like an expensive Scandinavian design item. Connects quickly to my phone.",
      validationStatus: "Supported by real evidence",
      tiedPersona: "The Impulsive Buyer",
      date: "2026-11-04"
    },
    {
      id: "ev-7",
      source: "Reddit r/headphones",
      rating: 3,
      sentiment: "Neutral",
      excerpt: "Multipoint works okay between Mac and iPhone, but it takes 3-4 seconds to switch audio focus. Fine for music, annoying for incoming Slack calls.",
      validationStatus: "Partially supported",
      tiedPersona: "The Rational Buyer",
      date: "2026-11-05"
    },
    {
      id: "ev-8",
      source: "Synthetic Hypothesis Engine",
      rating: 0,
      sentiment: "Neutral",
      excerpt: "Hypothesis: Ad headline lacks urgency trigger and fails to clarify whether wireless charging pad is included in the base box.",
      validationStatus: "Hypothesis",
      tiedPersona: "The Impulsive Buyer",
      date: "2026-11-06"
    }
  ]
};

export const INITIAL_CAMPAIGNS = [
  BENCHMARK_CAMPAIGN,
  {
    id: "demo-2",
    brandName: "Lumina Skin",
    productName: "Peptide Glow Serum",
    category: "Beauty",
    objective: "Conversions",
    headline: "Glass Skin in 7 Days Guaranteed.",
    callToAction: "Discover — $64",
    image: "assets/images/lumina-skin.svg",
    reviewCount: 124,
    groundingConfidence: 88,
    groundingStatus: "124 Reviews Analyzed",
    overallScore: 79,
    riskLevel: "moderate",
    riskLabel: "Moderate Friction",
    createdAt: "2026-11-05T09:15:00Z",
    metrics: {
      attention: 8.8,
      clarity: 8.1,
      credibility: 7.2,
      purchaseIntent: 7.5
    }
  },
  {
    id: "demo-3",
    brandName: "Veloce",
    productName: "PureFlow Filtered Bottle",
    category: "Apparel & Gear",
    objective: "Conversions",
    headline: "Mountain Purity From Any Tap.",
    callToAction: "Order — $45",
    image: "assets/images/veloce-bottle.svg",
    reviewCount: 86,
    groundingConfidence: 95,
    groundingStatus: "86 Reviews Analyzed",
    overallScore: 84,
    riskLevel: "scale",
    riskLabel: "Ready to Scale",
    createdAt: "2026-11-04T16:30:00Z",
    metrics: {
      attention: 8.5,
      clarity: 9.0,
      credibility: 8.6,
      purchaseIntent: 8.2
    }
  },
  {
    id: "demo-4",
    brandName: "NutriBite",
    productName: "Focus Bar Crunch",
    category: "Food & Beverage",
    objective: "Brand Recall",
    headline: "Clean Sustained Focus Without Crash.",
    callToAction: "Try Box — $32",
    image: "assets/images/nutribite-bar.svg",
    reviewCount: 32,
    groundingConfidence: 78,
    groundingStatus: "32 Reviews Analyzed",
    overallScore: 42,
    riskLevel: "high",
    riskLabel: "High Conversion Risk",
    createdAt: "2026-11-02T11:00:00Z",
    metrics: {
      attention: 6.2,
      clarity: 5.4,
      credibility: 3.5,
      purchaseIntent: 3.8
    }
  }
];

export const KPI_DATA = {
  totalAdsTested: 12,
  averageReadinessScore: 68,
  estimatedAdSpendSaved: 4850,
  realReviewsGrounded: 1420
};

export const INITIAL_CAMPAIGN_LIST = INITIAL_CAMPAIGNS;
