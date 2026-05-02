"use client";

import { useEffect } from "react";

export function ScrollAnimations() {
  useEffect(() => {
    document.documentElement.classList.add("js-reveal");

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const targets = document.querySelectorAll(".reveal");
    targets.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${(i % 4) * 80}ms`;
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return null;
}
