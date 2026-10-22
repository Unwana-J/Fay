"use client";

import React, { useMemo } from "react";

interface MathViewProps {
  /** The text or math expression to render. Math can be enclosed in $...$ or passed directly. */
  children: string;
  className?: string;
  /** If true, renders with display block styling (centered, larger margin) */
  block?: boolean;
}

/**
 * Lightweight, zero-dependency mathematical formula renderer for Fey.
 * 
 * Supports:
 * - \frac{numerator}{denominator} -> vertical stacked fraction with crisp bar
 * - \sqrt{expression} or \sqrt[n]{expression} -> radical with continuous overline
 * - x^{exponent} or x^2 -> superscript
 * - x_{subscript} or x_1 -> subscript
 * - Common symbols: \pi, \theta, \alpha, \beta, \times, \div, \pm, \approx, \le, \ge, \ne, \degree, \infty, \cdot
 * - Automatic serif styling for mathematical variables (x, y, z, n, k) with upright numerals
 */
export function MathView({ children, className = "", block = false }: MathViewProps) {
  const content = children || "";

  // Split text by $...$ math delimiters if present
  const tokens = useMemo(() => {
    if (!content.includes("$")) {
      return [{ isMath: hasMathCommands(content), text: content }];
    }

    const parts: { isMath: boolean; text: string }[] = [];
    const regex = /\$([^$]+)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ isMath: false, text: content.slice(lastIndex, match.index) });
      }
      parts.push({ isMath: true, text: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ isMath: false, text: content.slice(lastIndex) });
    }

    return parts;
  }, [content]);

  return (
    <span
      className={`${block ? "block my-2 text-center" : "inline-flex items-baseline flex-wrap gap-x-1"} ${className}`}
    >
      {tokens.map((token, idx) =>
        token.isMath ? (
          <MathInlineRenderer key={idx} expr={token.text} />
        ) : (
          <span key={idx}>{token.text}</span>
        )
      )}
    </span>
  );
}

function hasMathCommands(text: string): boolean {
  return /\\(frac|sqrt|pi|theta|times|div|pm|approx|le|ge|ne|degree|infty|cdot|\^|_)/.test(text);
}

/**
 * Renders an inline math expression into typed HTML nodes.
 */
function MathInlineRenderer({ expr }: { expr: string }) {
  const parsedNodes = useMemo(() => parseMathToNodes(expr.trim()), [expr]);
  return (
    <span className="inline-flex items-center align-middle font-serif tracking-normal mx-[1px] select-text">
      {parsedNodes}
    </span>
  );
}

/**
 * Parser for lightweight LaTeX math expressions.
 */
function parseMathToNodes(expr: string): React.ReactNode[] {
  let str = expr;

  // Replace simple macro symbols first
  str = str
    .replace(/\\times/g, " × ")
    .replace(/\\div/g, " ÷ ")
    .replace(/\\pm/g, " ± ")
    .replace(/\\approx/g, " ≈ ")
    .replace(/\\le/g, " ≤ ")
    .replace(/\\ge/g, " ≥ ")
    .replace(/\\ne/g, " ≠ ")
    .replace(/\\infty/g, " ∞ ")
    .replace(/\\cdot/g, " · ")
    .replace(/\\pi/g, "π")
    .replace(/\\theta/g, "θ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\Sigma/g, "Σ")
    .replace(/\\degree/g, "°");

  const nodes: React.ReactNode[] = [];
  let i = 0;
  let keyCount = 0;

  while (i < str.length) {
    // 1. Fractions: \frac{num}{den}
    if (str.startsWith("\\frac", i)) {
      const numStart = str.indexOf("{", i);
      if (numStart !== -1) {
        const numEnd = findMatchingBrace(str, numStart);
        if (numEnd !== -1) {
          const denStart = str.indexOf("{", numEnd + 1);
          if (denStart !== -1) {
            const denEnd = findMatchingBrace(str, denStart);
            if (denEnd !== -1) {
              const numText = str.slice(numStart + 1, numEnd);
              const denText = str.slice(denStart + 1, denEnd);

              nodes.push(
                <span
                  key={`frac-${keyCount++}`}
                  className="inline-flex flex-col items-center justify-center align-middle mx-1 text-[0.88em] leading-tight"
                  style={{ verticalAlign: "-0.28em" }}
                >
                  <span className="px-1 border-b border-current pb-[1px] text-center w-full">
                    {parseMathToNodes(numText)}
                  </span>
                  <span className="px-1 pt-[1px] text-center w-full">
                    {parseMathToNodes(denText)}
                  </span>
                </span>
              );

              i = denEnd + 1;
              continue;
            }
          }
        }
      }
    }

    // 2. Radicals / Square Roots: \sqrt{radicand} or \sqrt[n]{radicand}
    if (str.startsWith("\\sqrt", i)) {
      let currentIdx = i + 5;
      let rootDegree: string | null = null;

      if (str[currentIdx] === "[") {
        const degEnd = str.indexOf("]", currentIdx);
        if (degEnd !== -1) {
          rootDegree = str.slice(currentIdx + 1, degEnd);
          currentIdx = degEnd + 1;
        }
      }

      if (str[currentIdx] === "{") {
        const radEnd = findMatchingBrace(str, currentIdx);
        if (radEnd !== -1) {
          const radicand = str.slice(currentIdx + 1, radEnd);
          nodes.push(
            <span
              key={`sqrt-${keyCount++}`}
              className="inline-flex items-center align-middle mx-0.5"
            >
              {rootDegree && (
                <sup className="text-[0.65em] -mr-1 relative -top-1 font-sans">
                  {rootDegree}
                </sup>
              )}
              <span className="text-[1.15em] leading-none select-none font-serif">√</span>
              <span className="border-t border-current pt-[1px] px-0.5 ml-[1px] leading-tight">
                {parseMathToNodes(radicand)}
              </span>
            </span>
          );
          i = radEnd + 1;
          continue;
        }
      }
    }

    // 3. Superscripts: ^{exp} or ^x
    if (str[i] === "^") {
      let expText = "";
      let nextI = i + 1;
      if (str[i + 1] === "{") {
        const closeBrace = findMatchingBrace(str, i + 1);
        if (closeBrace !== -1) {
          expText = str.slice(i + 2, closeBrace);
          nextI = closeBrace + 1;
        }
      } else if (i + 1 < str.length) {
        expText = str[i + 1];
        nextI = i + 2;
      }

      if (expText) {
        nodes.push(
          <sup
            key={`sup-${keyCount++}`}
            className="text-[0.72em] relative -top-[0.45em] ml-[1px] font-medium"
          >
            {parseMathToNodes(expText)}
          </sup>
        );
        i = nextI;
        continue;
      }
    }

    // 4. Subscripts: _{sub} or _x
    if (str[i] === "_") {
      let subText = "";
      let nextI = i + 1;
      if (str[i + 1] === "{") {
        const closeBrace = findMatchingBrace(str, i + 1);
        if (closeBrace !== -1) {
          subText = str.slice(i + 2, closeBrace);
          nextI = closeBrace + 1;
        }
      } else if (i + 1 < str.length) {
        subText = str[i + 1];
        nextI = i + 2;
      }

      if (subText) {
        nodes.push(
          <sub
            key={`sub-${keyCount++}`}
            className="text-[0.72em] relative bottom-[0.2em] ml-[1px]"
          >
            {parseMathToNodes(subText)}
          </sub>
        );
        i = nextI;
        continue;
      }
    }

    // 5. Plain character / token processing (Variables vs Numbers/Symbols)
    const char = str[i];
    const isVariable = /[a-zA-Z]/.test(char) && !isEscapedLetter(str, i);

    nodes.push(
      <span
        key={`char-${keyCount++}`}
        className={isVariable ? "italic mx-[0.5px]" : "font-sans mx-[0.5px]"}
      >
        {char}
      </span>
    );
    i++;
  }

  return nodes;
}

function findMatchingBrace(str: string, openIndex: number): number {
  let depth = 0;
  for (let idx = openIndex; idx < str.length; idx++) {
    if (str[idx] === "{") depth++;
    else if (str[idx] === "}") {
      depth--;
      if (depth === 0) return idx;
    }
  }
  return -1;
}

function isEscapedLetter(str: string, index: number): boolean {
  return index > 0 && str[index - 1] === "\\";
}
