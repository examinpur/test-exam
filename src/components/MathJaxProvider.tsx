"use client";

import Script from "next/script";
import type { ReactNode } from "react";

export default function MathJaxProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        id="mathjax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
              },
              options: {
                skipHtmlTags: ['script','noscript','style','textarea','pre','code']
              }
            };
          `,
        }}
      />
      <Script
        id="mathjax-script"
        strategy="afterInteractive"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
      />

      {children}
    </>
  );
}
