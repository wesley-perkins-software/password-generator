import { test, expect } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const pageUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).toString();

const selectors = {
  generateButton: { role: "button", name: "Generate" } as const,
  copyButton: { role: "button", name: "Copy" } as const,
  status: { role: "status" } as const
};

test.describe("clipboard interactions", () => {
  test("copies the generated password and reports success", async ({ page }) => {
    await page.addInitScript(() => {
      // Override clipboard access with a deterministic stub for the test run.
      const calls: string[] = [];
      (window as typeof window & { __clipboardCalls?: string[] }).__clipboardCalls = calls;
      navigator.clipboard.writeText = async (text: string) => {
        calls.push(text);
      };
    });

    await page.goto(pageUrl);
    await page.getByRole(selectors.generateButton.role, { name: selectors.generateButton.name }).click();
    const copyButton = page.getByRole(selectors.copyButton.role, { name: selectors.copyButton.name });
    await copyButton.click();

    await expect(page.getByRole(selectors.status.role)).toHaveText("Password copied to clipboard.");
    await expect(copyButton).toBeEnabled();
  });

  test("shows the fallback message when clipboard access is rejected", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.clipboard.writeText = async () => {
        throw new Error("clipboard rejected");
      };
    });

    await page.goto(pageUrl);
    await page.getByRole(selectors.generateButton.role, { name: selectors.generateButton.name }).click();
    await page.getByRole(selectors.copyButton.role, { name: selectors.copyButton.name }).click();

    await expect(page.getByRole(selectors.status.role)).toHaveText("Clipboard unavailable. Copy manually.");
  });
});
