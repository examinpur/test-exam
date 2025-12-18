"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    MathJax?: any;
  }
}

type Props = {
  children: React.ReactNode;
  deps?: any[];
};

async function waitForMathJax(timeoutMs = 8000) {
  const start = Date.now();

  while (true) {
    const MJ = window.MathJax;
    if (MJ?.startup?.promise) return MJ;

    if (Date.now() - start > timeoutMs) {
      throw new Error("MathJax did not load in time");
    }

    await new Promise((r) => setTimeout(r, 50));
  }
}

export default function MathJaxTypesetter({ children, deps = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setReady(false);

      const el = ref.current;
      if (!el) return;

      let MJ: any;
      try {
        MJ = await waitForMathJax();
      } catch {
        // If MathJax fails, at least show raw content instead of blank
        if (!cancelled) setReady(true);
        return;
      }

      if (cancelled) return;

      MJ.typesetClear?.([el]);
      await MJ.typesetPromise?.([el]);

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, deps);

  return (
    <div
      ref={ref}
      className={ready ? "mathjax-ready" : "mathjax-pending"}
      aria-busy={!ready}
    >
      {children}
    </div>
  );
}
