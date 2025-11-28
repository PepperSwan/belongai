export interface Question {
  role: string;
  level: string;
  title: string;
  description: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  points: number;
}

export const questionBank: Record<string, Question[]> = {
  "Data Analyst": [
    {
      role: "Data Analyst",
      level: "Easy",
      title: "Understanding Business Metrics",
      description: "A company tracks their website traffic. Last month they had 10,000 visitors and 200 people signed up for their service.",
      question: "What is the conversion rate?",
      options: [
        { id: "a", text: "20%" },
        { id: "b", text: "2%" },
        { id: "c", text: "0.2%" },
        { id: "d", text: "50%" },
      ],
      correctAnswer: "b",
      explanation: "The conversion rate is 200 ÷ 10,000 = 0.02 = 2%. This metric shows what percentage of visitors took the desired action.",
      points: 10,
    },
    {
      role: "Data Analyst",
      level: "Medium",
      title: "Data Interpretation",
      description: "Sales data shows: Q1: $100k, Q2: $120k, Q3: $110k, Q4: $140k",
      question: "Which quarter showed the biggest percentage growth compared to the previous quarter?",
      options: [
        { id: "a", text: "Q2 (20% growth)" },
        { id: "b", text: "Q3 (10% decline)" },
        { id: "c", text: "Q4 (27% growth)" },
        { id: "d", text: "Q1 (baseline)" },
      ],
      correctAnswer: "c",
      explanation: "Q4 grew from $110k to $140k = $30k increase. $30k ÷ $110k = 27.3% growth, the highest percentage increase.",
      points: 15,
    },
  ],
  "UX Designer": [
    {
      role: "UX Designer",
      level: "Easy",
      title: "User-Centered Design",
      description: "You're designing a checkout process. Users report they often abandon their carts before completing purchase.",
      question: "What should be your first step to improve the experience?",
      options: [
        { id: "a", text: "Redesign the entire website" },
        { id: "b", text: "Research why users are abandoning carts" },
        { id: "c", text: "Add more payment options" },
        { id: "d", text: "Make the checkout button bigger" },
      ],
      correctAnswer: "b",
      explanation: "User research comes first! Understanding the root cause through user feedback, analytics, and testing helps you make informed design decisions.",
      points: 10,
    },
    {
      role: "UX Designer",
      level: "Medium",
      title: "Information Architecture",
      description: "A mobile app has 15 different features, and users say they can't find what they need.",
      question: "What UX principle would most help organize these features?",
      options: [
        { id: "a", text: "Card sorting to understand user mental models" },
        { id: "b", text: "Adding a search bar" },
        { id: "c", text: "Using brighter colors" },
        { id: "d", text: "Removing features" },
      ],
      correctAnswer: "a",
      explanation: "Card sorting reveals how users naturally group and categorize information, helping you create an intuitive navigation structure that matches their expectations.",
      points: 15,
    },
  ],
  "QA Tester": [
    {
      role: "QA Tester",
      level: "Easy",
      title: "Test Case Prioritization",
      description: "You have limited time to test a login feature before release.",
      question: "Which test case should you prioritize?",
      options: [
        { id: "a", text: "Test if the login button has correct hover color" },
        { id: "b", text: "Test if users can log in with valid credentials" },
        { id: "c", text: "Test if the logo loads quickly" },
        { id: "d", text: "Test if the footer links work" },
      ],
      correctAnswer: "b",
      explanation: "Critical functionality (logging in successfully) should always be tested first. This is the core feature users need, and failure would block access entirely.",
      points: 10,
    },
    {
      role: "QA Tester",
      level: "Medium",
      title: "Bug Reporting",
      description: "You find that clicking 'Submit' on a form sometimes fails, but only on certain days.",
      question: "What's the most important information to include in your bug report?",
      options: [
        { id: "a", text: "Just that the submit button is broken" },
        { id: "b", text: "Steps to reproduce, browser, date/time patterns, and expected vs actual behavior" },
        { id: "c", text: "A screenshot of the button" },
        { id: "d", text: "Your opinion on how to fix it" },
      ],
      correctAnswer: "b",
      explanation: "Complete bug reports with reproduction steps, environment details, and patterns help developers diagnose and fix issues quickly. Intermittent bugs need especially detailed documentation.",
      points: 15,
    },
  ],
  "Product Manager": [
    {
      role: "Product Manager",
      level: "Easy",
      title: "Feature Prioritization",
      description: "Your team can only build one feature this month. Users want: (A) Dark mode, (B) Password reset, (C) Animated backgrounds, (D) Social sharing.",
      question: "Which feature should you prioritize?",
      options: [
        { id: "a", text: "Dark mode - users are asking for it" },
        { id: "b", text: "Password reset - critical for users locked out" },
        { id: "c", text: "Animated backgrounds - looks impressive" },
        { id: "d", text: "Social sharing - could bring new users" },
      ],
      correctAnswer: "b",
      explanation: "Password reset solves a critical blocker that prevents users from accessing the product. It has high impact and removes a major friction point.",
      points: 10,
    },
    {
      role: "Product Manager",
      level: "Medium",
      title: "Stakeholder Management",
      description: "The CEO wants a feature by Friday, but the engineering team says it needs 2 weeks to build it properly.",
      question: "What's the best approach?",
      options: [
        { id: "a", text: "Tell the CEO it's impossible" },
        { id: "b", text: "Push engineering to work overtime" },
        { id: "c", text: "Discuss a phased approach: launch a basic version Friday, iterate after" },
        { id: "d", text: "Cancel other projects to free up time" },
      ],
      correctAnswer: "c",
      explanation: "A phased approach (MVP) balances stakeholder needs with engineering constraints. Launch core functionality quickly, then iterate based on feedback.",
      points: 15,
    },
  ],
  "Software Developer": [
    {
      role: "Software Developer",
      level: "Easy",
      title: "Debugging Logic",
      description: "Your code should display 'Hello' 5 times, but it only displays once.",
      question: "What's likely the issue?",
      options: [
        { id: "a", text: "The computer is broken" },
        { id: "b", text: "The loop counter isn't incrementing" },
        { id: "c", text: "The text is too long" },
        { id: "d", text: "You need faster internet" },
      ],
      correctAnswer: "b",
      explanation: "When a loop doesn't repeat as expected, the most common issue is the loop control variable isn't changing correctly, causing it to exit early or never iterate.",
      points: 10,
    },
    {
      role: "Software Developer",
      level: "Medium",
      title: "Code Efficiency",
      description: "You need to find if a specific user exists in a list of 1 million users. You'll do this thousands of times per second.",
      question: "What's the most efficient data structure for this task?",
      options: [
        { id: "a", text: "Array - simple and straightforward" },
        { id: "b", text: "Hash map/dictionary - O(1) lookup time" },
        { id: "c", text: "Linked list - flexible structure" },
        { id: "d", text: "Tree - organized hierarchy" },
      ],
      correctAnswer: "b",
      explanation: "A hash map provides O(1) constant-time lookups regardless of the data size, making it ideal for frequent searches in large datasets.",
      points: 15,
    },
  ],
  "Digital Marketer": [
    {
      role: "Digital Marketer",
      level: "Easy",
      title: "Campaign Metrics",
      description: "Your ad campaign spent $1000 and generated $3000 in sales.",
      question: "What is the Return on Ad Spend (ROAS)?",
      options: [
        { id: "a", text: "3x or 300%" },
        { id: "b", text: "$2000" },
        { id: "c", text: "30%" },
        { id: "d", text: "$3000" },
      ],
      correctAnswer: "a",
      explanation: "ROAS = Revenue ÷ Ad Spend = $3000 ÷ $1000 = 3x (or 3:1). For every dollar spent on ads, you generated $3 in revenue.",
      points: 10,
    },
    {
      role: "Digital Marketer",
      level: "Medium",
      title: "Audience Targeting",
      description: "Your product is eco-friendly water bottles. Two ad audiences performed: Audience A (fitness enthusiasts) - 5% conversion, Audience B (environmental activists) - 2% conversion.",
      question: "What should inform your next steps?",
      options: [
        { id: "a", text: "Focus all budget on Audience A since conversion is higher" },
        { id: "b", text: "Analyze both: customer lifetime value, messaging fit, and scale potential before deciding" },
        { id: "c", text: "Stop targeting Audience B immediately" },
        { id: "d", text: "Split budget 50/50 between both" },
      ],
      correctAnswer: "b",
      explanation: "Conversion rate alone doesn't tell the whole story. Environmental activists might have higher lifetime value, better brand alignment, or larger growth potential despite lower initial conversion.",
      points: 15,
    },
  ],
};

export const getQuestionsForRole = (role: string): Question[] => {
  const normalizedRole = role.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  return questionBank[normalizedRole] || [];
};
