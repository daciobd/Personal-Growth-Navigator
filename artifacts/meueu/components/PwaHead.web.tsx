import { useEffect } from "react";

const PWA_TAGS: Array<{ tag: "meta" | "link"; attrs: Record<string, string> }> = [
  { tag: "meta", attrs: { name: "application-name", content: "MeuEu" } },
  { tag: "meta", attrs: { name: "theme-color", content: "#1B6B5A" } },
  { tag: "meta", attrs: { name: "mobile-web-app-capable", content: "yes" } },
  { tag: "meta", attrs: { name: "apple-mobile-web-app-capable", content: "yes" } },
  { tag: "meta", attrs: { name: "apple-mobile-web-app-status-bar-style", content: "default" } },
  { tag: "meta", attrs: { name: "apple-mobile-web-app-title", content: "MeuEu" } },
  { tag: "meta", attrs: { name: "format-detection", content: "telephone=no" } },
  { tag: "link", attrs: { rel: "manifest", href: "/manifest.json" } },
  { tag: "link", attrs: { rel: "apple-touch-icon", href: "/icons/icon-192.png" } },
  { tag: "link", attrs: { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" } },
  { tag: "link", attrs: { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512.png" } },
];

export function PwaHead() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const injected: Element[] = [];

    for (const { tag, attrs } of PWA_TAGS) {
      const el = document.createElement(tag);
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
      document.head.appendChild(el);
      injected.push(el);
    }

    return () => {
      for (const el of injected) {
        el.parentNode?.removeChild(el);
      }
    };
  }, []);

  return null;
}
