import { test, expect, type Page } from "playwright/test";

const baseURL = process.env.BASE_URL;
test.use({ baseURL });

const API_URL = "https://akabab.github.io/superhero-api/api/all.json";
const heroes = [
  {
    id: 1,
    name: "A-Bomb",
    powerstats: { intelligence: 38, strength: 100, speed: 17, durability: 80, power: 24, combat: 64 },
    appearance: {
      gender: "Male",
      race: "Human",
      height: ["6'8", "203 cm"],
      weight: ["980 lb", "441 kg"],
      eyeColor: "Yellow",
      hairColor: "No Hair",
    },
    biography: { fullName: "Richard Milhouse Jones", publisher: "Marvel Comics" },
    work: { occupation: "Musician, adventurer, author; formerly talk show host", base: "-" },
    images: { lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/1-a-bomb.jpg" },
  },
  {
    id: 2,
    name: "Abe Sapien",
    powerstats: { intelligence: 88, strength: 28, speed: 35, durability: 65, power: 100, combat: 85 },
    appearance: {
      gender: "Male",
      race: "Icthyo Sapien",
      height: ["6'3", "191 cm"],
      weight: ["145 lb", "65 kg"],
      eyeColor: "Blue",
      hairColor: "No Hair",
    },
    biography: { fullName: "Abraham Sapien", publisher: "Dark Horse Comics" },
    work: { occupation: "Paranormal Investigator", base: "-" },
    images: { lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/2-abe-sapien.jpg" },
  },
];

async function mockHeroData(page: Page) {
  await page.route(API_URL, (route) => route.fulfill({ json: heroes }));
  await page.route("https://cdn.jsdelivr.net/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/gif",
      body: Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64"),
    }),
  );
}

async function searchForABomb(page: Page) {
  await page.getByPlaceholder("Search hero").fill("a-b");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("#displayCard").getByRole("heading", { name: "A-Bomb" })).toBeVisible();
}

test("initial load renders the returned hero cards", async ({ page }) => {
  await mockHeroData(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "A-Bomb" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Abe Sapien" })).toBeVisible();
  await expect(page.getByRole("img", { name: "A-Bomb" })).toBeVisible();
});

test("case-insensitive prefix search returns matching heroes", async ({ page }) => {
  await mockHeroData(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A-Bomb" })).toBeVisible();

  // The input has only a placeholder in the rendered HTML; see the input-label code gap in the plan.
  await page.getByPlaceholder("Search hero").pressSequentially("a-b");
  const results = page.locator("#displayCard");
  await expect(results.getByRole("heading", { name: "A-Bomb" })).toBeVisible();
  await expect(results.getByRole("heading", { name: "Abe Sapien" })).toHaveCount(0);
});

test("empty search displays its prompt", async ({ page }) => {
  await mockHeroData(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A-Bomb" })).toBeVisible();

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Type a hero's name...", { exact: true })).toBeVisible();
});

test("a search with no matches displays feedback", async ({ page }) => {
  await mockHeroData(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A-Bomb" })).toBeVisible();

  await page.getByPlaceholder("Search hero").fill("NoSuchHero");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("No heroes found!", { exact: true })).toBeVisible();
});

test("Appearance details return to the matching search result", async ({ page }) => {
  await mockHeroData(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A-Bomb" })).toBeVisible();
  await searchForABomb(page);

  const results = page.locator("#displayCard");
  await results.getByRole("button", { name: "Appearance" }).click();
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  await expect(page.getByText("Gender: Male", { exact: true })).toBeVisible();
  await expect(page.getByText("Race: Human", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator("#appearanceCard")).toBeHidden();
  await expect(results.getByRole("heading", { name: "A-Bomb" })).toBeVisible();
});

test("Work details return to the matching search result", async ({ page }) => {
  await mockHeroData(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A-Bomb" })).toBeVisible();
  await searchForABomb(page);

  const results = page.locator("#displayCard");
  await results.getByRole("button", { name: "Work" }).click();
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await expect(page.getByText("Occupation: Musician, adventurer, author; formerly talk show host", { exact: true })).toBeVisible();
  await expect(page.getByText("Base: -", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator("#appearanceCard")).toBeHidden();
  await expect(results.getByRole("heading", { name: "A-Bomb" })).toBeVisible();
});

test("failed hero data load presents the error alert", async ({ page }) => {
  await page.route(API_URL, (route) => route.abort());
  const alertMessage = new Promise<string>((resolve) => {
    page.once("dialog", async (dialog) => {
      const message = dialog.message();
      await dialog.accept();
      resolve(message);
    });
  });

  await page.goto("/");
  expect(await alertMessage).toBe("Cannot display hero");
  await expect(page.getByRole("heading", { name: "A-Bomb" })).toHaveCount(0);
});
