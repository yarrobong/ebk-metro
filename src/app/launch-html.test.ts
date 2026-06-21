import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("launch html shell", () => {
  it("defines the theme bootstrap directly in index.html", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");

    expect(html).toContain('name="theme-color" content="#F4F7F6"');
    expect(html).toContain('const storageKey = "metro-theme"');
    expect(html).toContain('window.matchMedia("(prefers-color-scheme: dark)")');
    expect(html).toContain("root.dataset.theme = theme");
    expect(html).toContain("background: var(--launch-bg)");
    expect(html).toContain("viewport-fit=cover");
    expect(html).toContain('class="launch-screen"');
    expect(html).toContain("Метро Екатеринбурга");
    expect(html).toContain("Загружаем расписание");
  });

  it("keeps the themed redirect shell in the offline fallback page", () => {
    const html = readFileSync(resolve(process.cwd(), "public/404.html"), "utf-8");

    expect(html).toContain('name="theme-color" content="#F4F7F6"');
    expect(html).toContain('const storageKey = "metro-theme"');
    expect(html).toContain("background: var(--redirect-bg)");
    expect(html).toContain("viewport-fit=cover");
  });
});
