import { expect, test } from "@playwright/test";

import { expectStationsScreen, openApp, selectRoute } from "./helpers";

const LIGHT_THEME_COLOR = "#F4F7F6";
const DARK_THEME_COLOR = "#0B0E12";

test.describe("theme preferences", () => {
  test("uses the light theme when the system preference is light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await openApp(page);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      LIGHT_THEME_COLOR,
    );

    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).backgroundColor,
      ),
    ).toBe("rgb(244, 247, 246)");
    await expectStationsScreen(page);
  });

  test("uses the dark theme when the system preference is dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await openApp(page);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      DARK_THEME_COLOR,
    );
  });

  test("persists a manual light preference and ignores later system changes", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await openApp(page);

    await page.getByRole("button", { name: "Настройки" }).click();
    await page.getByRole("radio", { name: "Светлая" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.reload();
    await expectStationsScreen(page);
    await page.getByRole("button", { name: "Настройки" }).click();

    expect(await page.evaluate(() => localStorage.getItem("metro-theme"))).toBe("light");

    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("returns to following the device after choosing automatic", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(() => {
      window.localStorage.setItem("metro-theme", "light");
    });
    await openApp(page);

    await page.getByRole("button", { name: "Настройки" }).click();
    await page.getByRole("radio", { name: "Автоматически" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("stays visually stable at narrow and desktop widths", async ({ page }) => {
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: "light" });
      await openApp(page);

      expect(
        await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth <= root.clientWidth;
        }),
      ).toBe(true);

      await selectRoute(page, "Геологическая", "В сторону Ботанической");
      await expect(page.getByText("Текущая станция")).toBeVisible();
      await expect(page.getByText("Куда едете?")).toBeVisible();

      await page.getByRole("button", { name: "Настройки" }).click();
      await expect(page.getByRole("heading", { name: "Настройки" })).toBeVisible();
    }
  });
});
