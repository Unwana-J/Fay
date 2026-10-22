/**
 * Mathletics Question Bank & Types
 * 
 * Curated intellectual challenges across 5 mathematical pillars:
 * 1. Mental Arithmetic & Estimation
 * 2. Algebra & Patterns
 * 3. Probability & Odds
 * 4. Geometry & Spatial Logic
 * 5. Number Theory & Puzzles
 * 
 * Every question is designed to be solvable within 25 seconds via
 * mathematical intuition, structural insight, or elegant shortcuts.
 */

export type MathleticsCategory =
  | "Mental Arithmetic & Estimation"
  | "Algebra & Patterns"
  | "Probability & Odds"
  | "Geometry & Spatial Logic"
  | "Number Theory & Puzzles";

export type MathleticsDifficulty = "easy" | "medium" | "hard";
export type MathleticsDifficultyFilter = "random" | "easy" | "medium" | "hard";

export interface MathleticsQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0-indexed correct option (0, 1, 2, or 3)
  category: MathleticsCategory;
  difficulty: MathleticsDifficulty;
  explanation: string;
}

export const MATHLETICS_CATEGORIES: MathleticsCategory[] = [
  "Mental Arithmetic & Estimation",
  "Algebra & Patterns",
  "Probability & Odds",
  "Geometry & Spatial Logic",
  "Number Theory & Puzzles",
];

export const MATHLETICS_QUESTIONS: MathleticsQuestion[] = [
  // ─── 1. MENTAL ARITHMETIC & ESTIMATION ────────────────────────────────────
  {
    id: "m_arith_001",
    category: "Mental Arithmetic & Estimation",
    difficulty: "easy",
    question: "What is 15% of 240?",
    options: ["32", "36", "38", "42"],
    answer: 1,
    explanation: "Shortcut: 10% of 240 is 24. Half of that (5%) is 12. Add them together: 24 + 12 = 36.",
  },
  {
    id: "m_arith_002",
    category: "Mental Arithmetic & Estimation",
    difficulty: "easy",
    question: "Compute $35^2$ without a calculator.",
    options: ["1125", "1225", "1325", "1250"],
    answer: 1,
    explanation: "Shortcut for numbers ending in 5: Multiply the tens digit (3) by the next integer (4) to get 12, then append 25. Thus $35^2 = 1225$.",
  },
  {
    id: "m_arith_003",
    category: "Mental Arithmetic & Estimation",
    difficulty: "easy",
    question: "What is $16 \\times 25$?",
    options: ["360", "380", "400", "420"],
    answer: 2,
    explanation: "Double and halve: Divide 16 by 4 (to get 4) and multiply 25 by 4 (to get 100). $4 \\times 100 = 400$.",
  },
  {
    id: "m_arith_004",
    category: "Mental Arithmetic & Estimation",
    difficulty: "easy",
    question: "What is the sum of integers from 1 to 20?",
    options: ["190", "200", "210", "220"],
    answer: 2,
    explanation: "Gauss pairing: $\\frac{n(n+1)}{2} = \\frac{20 \\times 21}{2} = 10 \\times 21 = 210$.",
  },
  {
    id: "m_arith_005",
    category: "Mental Arithmetic & Estimation",
    difficulty: "medium",
    question: "Evaluate $51 \\times 49$ using mental algebra.",
    options: ["2489", "2499", "2501", "2509"],
    answer: 1,
    explanation: "Difference of squares: $(50 + 1)(50 - 1) = 50^2 - 1^2 = 2500 - 1 = 2499$.",
  },
  {
    id: "m_arith_006",
    category: "Mental Arithmetic & Estimation",
    difficulty: "medium",
    question: "Under the Rule of 72, approximately how many years does it take an investment to double at 8% annual return?",
    options: ["7 years", "9 years", "11 years", "12 years"],
    answer: 1,
    explanation: "The Rule of 72 states doubling time $\\approx 72 / r$. Here $72 / 8 = 9$ years.",
  },
  {
    id: "m_arith_007",
    category: "Mental Arithmetic & Estimation",
    difficulty: "medium",
    question: "Which integer is closest to $\\sqrt{85}$?",
    options: ["8", "9", "10", "11"],
    answer: 1,
    explanation: "$9^2 = 81$ and $10^2 = 100$. 85 is only 4 away from 81, so $\\sqrt{85} \\approx 9.2$, closest to 9.",
  },
  {
    id: "m_arith_008",
    category: "Mental Arithmetic & Estimation",
    difficulty: "medium",
    question: "What is $125\\%$ of 64?",
    options: ["72", "76", "80", "84"],
    answer: 2,
    explanation: "$125\\% = \\frac{5}{4}$. One-fourth of 64 is 16. $5 \\times 16 = 80$ (or $64 + 16 = 80$).",
  },
  {
    id: "m_arith_009",
    category: "Mental Arithmetic & Estimation",
    difficulty: "hard",
    question: "Which of the following is larger: $2^{50}$ or $3^{30}$?",
    options: ["$2^{50}$ is larger", "$3^{30}$ is larger", "They are exactly equal", "Cannot be determined without a table"],
    answer: 0,
    explanation: "Express both with exponent 10: $2^{50} = (2^5)^{10} = 32^{10}$. $3^{30} = (3^3)^{10} = 27^{10}$. Since $32 > 27$, $2^{50} > 3^{30}$.",
  },
  {
    id: "m_arith_010",
    category: "Mental Arithmetic & Estimation",
    difficulty: "hard",
    question: "Approximately how many seconds are there in a standard 30-day month?",
    options: ["$8.6 \\times 10^5$", "$2.6 \\times 10^6$", "$5.2 \\times 10^6$", "$8.6 \\times 10^6$"],
    answer: 1,
    explanation: "One day has $24 \\times 3600 = 86,400$ seconds. $30 \\times 86,400 = 2,592,000 \\approx 2.6 \\times 10^6$ seconds.",
  },
  {
    id: "m_arith_011",
    category: "Mental Arithmetic & Estimation",
    difficulty: "easy",
    question: "What is $48 \\times 5$ calculated in your head?",
    options: ["220", "240", "260", "280"],
    answer: 1,
    explanation: "Multiply by 10 and divide by 2: $48 \\times 10 = 480$, and half of 480 is 240.",
  },
  {
    id: "m_arith_012",
    category: "Mental Arithmetic & Estimation",
    difficulty: "hard",
    question: "Compute $98^2$ mentally.",
    options: ["9404", "9604", "9804", "9704"],
    answer: 1,
    explanation: "$(100 - 2)^2 = 100^2 - 2(100)(2) + 2^2 = 10000 - 400 + 4 = 9604$.",
  },

  // ─── 2. ALGEBRA & PATTERNS ────────────────────────────────────────────────
  {
    id: "m_alg_001",
    category: "Algebra & Patterns",
    difficulty: "easy",
    question: "Solve for $x$: $3x + 7 = 28$.",
    options: ["5", "7", "8", "9"],
    answer: 1,
    explanation: "Subtract 7 from both sides: $3x = 21$. Divide by 3: $x = 7$.",
  },
  {
    id: "m_alg_002",
    category: "Algebra & Patterns",
    difficulty: "easy",
    question: "What is the next number in the sequence: $2, 6, 12, 20, 30, \\dots$?",
    options: ["36", "40", "42", "44"],
    answer: 2,
    explanation: "Pattern of consecutive product $n(n+1)$: $1\\times 2=2$, $2\\times 3=6$, $3\\times 4=12$, $4\\times 5=20$, $5\\times 6=30$. The next is $6\\times 7 = 42$.",
  },
  {
    id: "m_alg_003",
    category: "Algebra & Patterns",
    difficulty: "easy",
    question: "If $x^2 - 16 = 0$ and $x < 0$, what is $x$?",
    options: ["-8", "-4", "-2", "4"],
    answer: 1,
    explanation: "Factoring difference of squares: $(x-4)(x+4)=0$. Since $x < 0$, $x = -4$.",
  },
  {
    id: "m_alg_004",
    category: "Algebra & Patterns",
    difficulty: "medium",
    question: "What is the sum of the roots of the quadratic equation $x^2 - 7x + 10 = 0$?",
    options: ["-7", "5", "7", "10"],
    answer: 2,
    explanation: "Vieta's formula: For $ax^2 + bx + c = 0$, the sum of roots is $-b/a = -(-7)/1 = 7$.",
  },
  {
    id: "m_alg_005",
    category: "Algebra & Patterns",
    difficulty: "medium",
    question: "If $f(x) = 2x + 3$, what is $f(f(2))$?",
    options: ["14", "17", "19", "21"],
    answer: 1,
    explanation: "First evaluate inside: $f(2) = 2(2) + 3 = 7$. Then $f(7) = 2(7) + 3 = 14 + 3 = 17$.",
  },
  {
    id: "m_alg_006",
    category: "Algebra & Patterns",
    difficulty: "medium",
    question: "Find the sum of the infinite geometric series: $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\dots$",
    options: ["1.5", "2", "2.5", "$\\infty$"],
    answer: 1,
    explanation: "Infinite geometric series formula: $S = \\frac{a}{1 - r} = \\frac{1}{1 - 0.5} = 2$.",
  },
  {
    id: "m_alg_007",
    category: "Algebra & Patterns",
    difficulty: "hard",
    question: "If $x + \\frac{1}{x} = 4$, what is the value of $x^2 + \\frac{1}{x^2}$?",
    options: ["12", "14", "16", "18"],
    answer: 1,
    explanation: "Square both sides: $(x + \\frac{1}{x})^2 = x^2 + 2 + \\frac{1}{x^2} = 4^2 = 16$. Subtract 2: $x^2 + \\frac{1}{x^2} = 14$.",
  },
  {
    id: "m_alg_008",
    category: "Algebra & Patterns",
    difficulty: "hard",
    question: "Evaluate the telescoping sum: $\\frac{1}{1\\times 2} + \\frac{1}{2\\times 3} + \\frac{1}{3\\times 4} + \\dots + \\frac{1}{99\\times 100}$.",
    options: ["$\\frac{99}{100}$", "$\\frac{100}{101}$", "$\\frac{1}{100}$", "1"],
    answer: 0,
    explanation: "Notice $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$. All intermediate terms cancel, leaving $1 - \\frac{1}{100} = \\frac{99}{100}$.",
  },
  {
    id: "m_alg_009",
    category: "Algebra & Patterns",
    difficulty: "easy",
    question: "What is the 8th term of the Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13...?",
    options: ["18", "21", "24", "26"],
    answer: 1,
    explanation: "Each term is the sum of the preceding two: $8 + 13 = 21$.",
  },
  {
    id: "m_alg_010",
    category: "Algebra & Patterns",
    difficulty: "medium",
    question: "If $3^x = 81$, what is $3^{x-2}$?",
    options: ["3", "9", "27", "1"],
    answer: 1,
    explanation: "$3^x = 81 \\implies x = 4$. Therefore $3^{4-2} = 3^2 = 9$ (or simply $81 / 3^2 = 81 / 9 = 9$).",
  },
  {
    id: "m_alg_011",
    category: "Algebra & Patterns",
    difficulty: "hard",
    question: "If $a + b = 5$ and $ab = 6$, find $a^3 + b^3$.",
    options: ["25", "35", "45", "65"],
    answer: 1,
    explanation: "Formula: $a^3 + b^3 = (a+b)(a^2 - ab + b^2) = (a+b)((a+b)^2 - 3ab) = 5(25 - 18) = 5(7) = 35$. (Or notice the roots are 2 and 3: $8 + 27 = 35$).",
  },

  // ─── 3. PROBABILITY & ODDS ────────────────────────────────────────────────
  {
    id: "m_prob_001",
    category: "Probability & Odds",
    difficulty: "easy",
    question: "What is the probability of flipping three coins and getting all heads?",
    options: ["$\\frac{1}{4}$", "$\\frac{1}{6}$", "$\\frac{1}{8}$", "$\\frac{1}{16}$"],
    answer: 2,
    explanation: "Each flip has probability $\\frac{1}{2}$. For three independent flips: $(\\frac{1}{2})^3 = \\frac{1}{8}$.",
  },
  {
    id: "m_prob_002",
    category: "Probability & Odds",
    difficulty: "easy",
    question: "Rolling a standard 6-sided die, what is the probability of rolling a prime number?",
    options: ["$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$", "$\\frac{5}{6}$"],
    answer: 1,
    explanation: "The prime numbers on a die are 2, 3, and 5 (1 is not prime). That is 3 out of 6 outcomes: $\\frac{3}{6} = \\frac{1}{2}$.",
  },
  {
    id: "m_prob_003",
    category: "Probability & Odds",
    difficulty: "medium",
    question: "What is the probability of rolling a sum of 7 with two fair 6-sided dice?",
    options: ["$\\frac{1}{6}$", "$\\frac{5}{36}$", "$\\frac{7}{36}$", "$\\frac{1}{12}$"],
    answer: 0,
    explanation: "Favorable pairs for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs out of 36 total: $\\frac{6}{36} = \\frac{1}{6}$.",
  },
  {
    id: "m_prob_004",
    category: "Probability & Odds",
    difficulty: "medium",
    question: "A bag has 4 red and 6 blue marbles. If you pick one, replace it, and pick another, what is the probability both are red?",
    options: ["16%", "20%", "24%", "36%"],
    answer: 0,
    explanation: "Independent draws: $P(\\text{Red}) = \\frac{4}{10} = 0.4$. Both red: $0.4 \\times 0.4 = 0.16 = 16\\%$.",
  },
  {
    id: "m_prob_005",
    category: "Probability & Odds",
    difficulty: "medium",
    question: "What is the probability of getting AT LEAST one heads in 3 flips of a fair coin?",
    options: ["$\\frac{3}{4}$", "$\\frac{7}{8}$", "$\\frac{5}{8}$", "$\\frac{1}{2}$"],
    answer: 1,
    explanation: "Complement rule: $1 - P(\\text{all tails}) = 1 - (\\frac{1}{2})^3 = 1 - \\frac{1}{8} = \\frac{7}{8}$.",
  },
  {
    id: "m_prob_006",
    category: "Probability & Odds",
    difficulty: "hard",
    question: "In the famous Monty Hall problem with 3 doors, what is your probability of winning the car if you SWITCH doors?",
    options: ["$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$", "$\\frac{3}{4}$"],
    answer: 2,
    explanation: "Your initial door had a $\\frac{1}{3}$ chance of having the car. The remaining doors held a $\\frac{2}{3}$ chance. Since the host reveals a goat, switching captures the entire $\\frac{2}{3}$ probability.",
  },
  {
    id: "m_prob_007",
    category: "Probability & Odds",
    difficulty: "hard",
    question: "How many distinct ways can 5 people be seated in a circle?",
    options: ["24", "60", "120", "20"],
    answer: 0,
    explanation: "Circular permutations of $n$ items: $(n - 1)!$. For 5 people: $(5 - 1)! = 4! = 4 \\times 3 \\times 2 \\times 1 = 24$.",
  },
  {
    id: "m_prob_008",
    category: "Probability & Odds",
    difficulty: "hard",
    question: "Two fair dice are rolled. Given that at least one die shows a 6, what is the probability that the other die also shows a 6?",
    options: ["$\\frac{1}{6}$", "$\\frac{1}{11}$", "$\\frac{1}{36}$", "$\\frac{2}{11}$"],
    answer: 1,
    explanation: "Conditional probability: Outcomes with at least one 6: 11 pairs. Only (6,6) has both dice showing 6. Probability = $\\frac{1}{11}$.",
  },
  {
    id: "m_prob_009",
    category: "Probability & Odds",
    difficulty: "easy",
    question: "If an event has odds of $3:1$ in favor, what is its probability?",
    options: ["25%", "33.3%", "75%", "80%"],
    answer: 2,
    explanation: "Odds of $a:b$ in favor corresponds to probability $\\frac{a}{a+b}$. Here $\\frac{3}{3+1} = \\frac{3}{4} = 75\\%$.",
  },
  {
    id: "m_prob_010",
    category: "Probability & Odds",
    difficulty: "medium",
    question: "How many ways can you choose a committee of 2 people from a group of 6?",
    options: ["12", "15", "18", "30"],
    answer: 1,
    explanation: "Combinations $\\binom{6}{2} = \\frac{6 \\times 5}{2 \\times 1} = 15$.",
  },

  // ─── 4. GEOMETRY & SPATIAL LOGIC ──────────────────────────────────────────
  {
    id: "m_geom_001",
    category: "Geometry & Spatial Logic",
    difficulty: "easy",
    question: "A right triangle has legs of length 6 and 8. What is the length of its hypotenuse?",
    options: ["9", "10", "12", "14"],
    answer: 1,
    explanation: "Standard 3-4-5 Pythagorean triple scaled by 2: $2 \\times 5 = 10$ (or $\\sqrt{36 + 64} = \\sqrt{100} = 10$).",
  },
  {
    id: "m_geom_002",
    category: "Geometry & Spatial Logic",
    difficulty: "easy",
    question: "What is the sum of the interior angles of any planar pentagon (5-sided polygon)?",
    options: ["360°", "450°", "540°", "720°"],
    answer: 2,
    explanation: "Polygon angle formula: $(n - 2) \\times 180° = (5 - 2) \\times 180° = 3 \\times 180° = 540°$.",
  },
  {
    id: "m_geom_003",
    category: "Geometry & Spatial Logic",
    difficulty: "medium",
    question: "What is the angle between the hour hand and minute hand of an analog clock at 3:30?",
    options: ["70°", "75°", "80°", "90°"],
    answer: 1,
    explanation: "At 3:30, the minute hand is at 180° (on the 6). The hour hand has moved halfway between 3 and 4 (at $90° + 15° = 105°$). Difference: $180° - 105° = 75°$.",
  },
  {
    id: "m_geom_004",
    category: "Geometry & Spatial Logic",
    difficulty: "medium",
    question: "A square has a diagonal of length 10. What is the area of the square?",
    options: ["25", "50", "75", "100"],
    answer: 1,
    explanation: "Area of a square with diagonal $d$ is $\\frac{d^2}{2} = \\frac{100}{2} = 50$.",
  },
  {
    id: "m_geom_005",
    category: "Geometry & Spatial Logic",
    difficulty: "medium",
    question: "If the radius of a circle is doubled, by what factor does its area increase?",
    options: ["2", "4", "8", "$\\pi$"],
    answer: 1,
    explanation: "Area is proportional to $r^2$. Doubling the radius quadruples the area: $(2r)^2 = 4r^2$.",
  },
  {
    id: "m_geom_006",
    category: "Geometry & Spatial Logic",
    difficulty: "hard",
    question: "What is the length of the space diagonal of a cube with side length 5?",
    options: ["$5\\sqrt{2}$", "$5\\sqrt{3}$", "10", "15"],
    answer: 1,
    explanation: "3D diagonal formula: $d = \\sqrt{s^2 + s^2 + s^2} = s\\sqrt{3} = 5\\sqrt{3}$.",
  },
  {
    id: "m_geom_007",
    category: "Geometry & Spatial Logic",
    difficulty: "hard",
    question: "According to Euler's polyhedral formula ($V - E + F = 2$), if a polyhedron has 12 vertices and 8 faces, how many edges does it have?",
    options: ["16", "18", "20", "22"],
    answer: 1,
    explanation: "$12 - E + 8 = 2 \\implies 20 - E = 2 \\implies E = 18$.",
  },
  {
    id: "m_geom_008",
    category: "Geometry & Spatial Logic",
    difficulty: "hard",
    question: "An equilateral triangle has side length 6. What is its exact area?",
    options: ["$9\\sqrt{3}$", "$18\\sqrt{3}$", "18", "27"],
    answer: 0,
    explanation: "Area formula for equilateral triangle: $\\frac{\\sqrt{3}}{4}s^2 = \\frac{\\sqrt{3}}{4}(36) = 9\\sqrt{3}$.",
  },
  {
    id: "m_geom_009",
    category: "Geometry & Spatial Logic",
    difficulty: "easy",
    question: "Two complementary angles sum to 90°. If one angle is 37°, what is the other?",
    options: ["43°", "53°", "63°", "143°"],
    answer: 1,
    explanation: "$90° - 37° = 53°$.",
  },
  {
    id: "m_geom_010",
    category: "Geometry & Spatial Logic",
    difficulty: "medium",
    question: "Which of the following sets of lengths CANNOT form a valid triangle?",
    options: ["3, 4, 5", "5, 12, 13", "4, 5, 10", "7, 8, 9"],
    answer: 2,
    explanation: "Triangle inequality theorem: The sum of any two sides must exceed the third. Here $4 + 5 = 9 < 10$, so it cannot close into a triangle.",
  },

  // ─── 5. NUMBER THEORY & PUZZLES ───────────────────────────────────────────
  {
    id: "m_num_001",
    category: "Number Theory & Puzzles",
    difficulty: "easy",
    question: "What is the smallest positive integer divisible by all numbers from 1 to 6?",
    options: ["30", "60", "120", "720"],
    answer: 1,
    explanation: "Least Common Multiple: $\\text{LCM}(1, 2, 3, 4, 5, 6) = 2^2 \\times 3 \\times 5 = 60$.",
  },
  {
    id: "m_num_002",
    category: "Number Theory & Puzzles",
    difficulty: "easy",
    question: "A number is divisible by 9 if and only if:",
    options: ["Its last digit is 9", "Its last two digits form a multiple of 9", "The sum of its digits is a multiple of 9", "It is both odd and prime"],
    answer: 2,
    explanation: "Because $10 \\equiv 1 \\pmod 9$, any integer is congruent to the sum of its digits modulo 9.",
  },
  {
    id: "m_num_003",
    category: "Number Theory & Puzzles",
    difficulty: "medium",
    question: "What is the remainder when $7^{100}$ is divided by 10 (i.e. what is its units digit)?",
    options: ["1", "3", "7", "9"],
    answer: 0,
    explanation: "Units digit powers of 7 cycle with period 4: $7^1=7$, $7^2=9$, $7^3=3$, $7^4=1$. Since $100$ is a multiple of 4, $7^{100}$ ends in 1.",
  },
  {
    id: "m_num_004",
    category: "Number Theory & Puzzles",
    difficulty: "medium",
    question: "How many total positive divisors does the number 36 have?",
    options: ["7", "8", "9", "10"],
    answer: 2,
    explanation: "Prime factorization: $36 = 2^2 \\times 3^2$. Number of divisors = $(2+1)(2+1) = 3 \\times 3 = 9$.",
  },
  {
    id: "m_num_005",
    category: "Number Theory & Puzzles",
    difficulty: "medium",
    question: "At a conference, 10 scholars each shake hands once with every other scholar. How many total handshakes occur?",
    options: ["45", "50", "90", "100"],
    answer: 0,
    explanation: "Handshake formula: $\\frac{n(n-1)}{2} = \\frac{10 \\times 9}{2} = 45$.",
  },
  {
    id: "m_num_006",
    category: "Number Theory & Puzzles",
    difficulty: "hard",
    question: "In the 100 lockers problem, only lockers with an ODD number of factors remain open after 100 passes. Which lockers are these?",
    options: ["Prime numbered lockers", "Even numbered lockers", "Perfect square lockers", "Multiples of 5"],
    answer: 2,
    explanation: "Divisors always come in pairs $(d, n/d)$ except when $d = \\sqrt{n}$. Thus only perfect squares ($1, 4, 9, 16, 25\\dots$) have an odd number of divisors.",
  },
  {
    id: "m_num_007",
    category: "Number Theory & Puzzles",
    difficulty: "hard",
    question: "What is the remainder when $2^{100}$ is divided by 3?",
    options: ["0", "1", "2", "Cannot be determined"],
    answer: 1,
    explanation: "Modulo 3: $2 \\equiv -1 \\pmod 3$. Therefore $2^{100} \\equiv (-1)^{100} \\equiv 1 \\pmod 3$.",
  },
  {
    id: "m_num_008",
    category: "Number Theory & Puzzles",
    difficulty: "hard",
    question: "How many zeros are at the end of $25!$ (25 factorial)?",
    options: ["4", "5", "6", "7"],
    answer: 2,
    explanation: "Legendre's formula counts factors of 5: $\\lfloor 25/5 \\rfloor + \\lfloor 25/25 \\rfloor = 5 + 1 = 6$ trailing zeros.",
  },
  {
    id: "m_num_009",
    category: "Number Theory & Puzzles",
    difficulty: "easy",
    question: "Which of the following numbers is prime?",
    options: ["51", "57", "67", "91"],
    answer: 2,
    explanation: "$51 = 3 \\times 17$; $57 = 3 \\times 19$; $91 = 7 \\times 13$. 67 has no divisors other than 1 and itself.",
  },
  {
    id: "m_num_010",
    category: "Number Theory & Puzzles",
    difficulty: "medium",
    question: "What is the Greatest Common Divisor (GCD) of 84 and 180?",
    options: ["6", "12", "14", "18"],
    answer: 1,
    explanation: "Euclidean algorithm: $180 = 2 \\times 84 + 12$. Then $84 = 7 \\times 12 + 0$. The last non-zero remainder is 12.",
  },
  {
    id: "m_num_011",
    category: "Number Theory & Puzzles",
    difficulty: "hard",
    question: "By Fermat's Little Theorem, if $p$ is a prime and $\\gcd(a, p) = 1$, what is $a^{p-1} \\pmod p$?",
    options: ["0", "1", "$p-1$", "$a$"],
    answer: 1,
    explanation: "Fermat's Little Theorem states $a^{p-1} \\equiv 1 \\pmod p$ for any integer $a$ coprime to prime $p$.",
  },
];

/**
 * Filter and sample questions based on criteria.
 */
export function getMathleticsQuestions(options?: {
  count?: number;
  difficulty?: MathleticsDifficultyFilter;
  category?: MathleticsCategory | "all";
  excludeIds?: string[];
}): MathleticsQuestion[] {
  const count = options?.count ?? 10;
  const difficulty = options?.difficulty ?? "random";
  const category = options?.category ?? "all";
  const excludeIds = new Set(options?.excludeIds || []);

  let pool = MATHLETICS_QUESTIONS.filter((q) => !excludeIds.has(q.id));

  // If exclusions eliminate too many, fall back to full pool
  if (pool.length < count) {
    pool = [...MATHLETICS_QUESTIONS];
  }

  if (category && category !== "all") {
    const categoryFiltered = pool.filter((q) => q.category === category);
    if (categoryFiltered.length >= count) {
      pool = categoryFiltered;
    }
  }

  if (difficulty && difficulty !== "random") {
    const diffFiltered = pool.filter((q) => q.difficulty === difficulty);
    if (diffFiltered.length >= count) {
      pool = diffFiltered;
    }
  }

  // Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Fetch a question by its unique identifier.
 */
export function getMathleticsQuestionById(id: string): MathleticsQuestion | undefined {
  return MATHLETICS_QUESTIONS.find((q) => q.id === id);
}
