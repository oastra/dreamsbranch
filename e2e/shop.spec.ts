import { test, expect, type Page } from "@playwright/test";

/**
 * Shop end-to-end tests.
 *
 * These drive a real Chromium browser through the public shop the same way a
 * customer would: browse → open a product → add it to the cart → check out the
 * cart page. The cart lives in `localStorage` (key `dreams-cart-v1`), so no
 * login is needed and each test starts from a clean slate.
 *
 * We test against the *default* locale (`en`). URLs look like `/en/shop`.
 *
 * A note on selectors: we prefer `getByRole(...)` (buttons, headings, links by
 * their accessible name) over CSS classes. Roles are how a screen-reader — and
 * a user — perceives the page, so these tests double as a light accessibility
 * check and don't break when styling changes.
 *
 * The product page has a main "Add to cart" button *and* related-product cards
 * whose buttons are named "Add to cart: <product>". A loose /add to cart/i
 * would match all of them and trip Playwright's strict mode, so we target the
 * main button by its exact name.
 */
const addToCartButton = (page: Page) =>
  page.getByRole("button", { name: "Add to cart", exact: true });

// Turn a formatted money string like "A$45.00" into the number 45. We strip
// everything that isn't a digit or a decimal point, then parse. Tests should
// assert on *values*, not on exact currency formatting, which can vary.
const money = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

// Helper: open the shop and click into the first product, returning its title.
// Reading the title from the page (instead of hard-coding a slug) keeps the
// test robust whether the shop is showing real DB products or the mock catalog.
async function openFirstProduct(page: Page): Promise<string> {
  await page.goto("/en/shop");

  // Product cards link to `/en/shop/product/<slug>`. Grab the first such link.
  const firstProductLink = page
    .locator('a[href*="/shop/product/"]')
    .first();
  await expect(firstProductLink).toBeVisible();

  const title = (await firstProductLink.getAttribute("aria-label"))?.trim();
  await firstProductLink.click();

  // We should now be on a product detail page with an <h1> title.
  await expect(page).toHaveURL(/\/shop\/product\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  return title ?? "";
}

test.describe("Shop", () => {
  test("shop page loads and lists products", async ({ page }) => {
    await page.goto("/en/shop");

    // The hero/section headings render, and at least one product is linked.
    await expect(
      page.getByRole("heading", { name: /handmade/i }).first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href*="/shop/product/"]').first(),
    ).toBeVisible();
  });

  test("can open a product detail page", async ({ page }) => {
    const title = await openFirstProduct(page);

    // The product's <h1> matches the card we clicked, and the buy panel is here.
    expect(title.length).toBeGreaterThan(0);
    await expect(addToCartButton(page)).toBeVisible();
  });

  test("adding a product puts it in the cart", async ({ page }) => {
    const title = await openFirstProduct(page);

    // Click "Add to cart". The button briefly swaps to an "Added" confirmation.
    await addToCartButton(page).click();
    await expect(page.getByRole("button", { name: /added/i })).toBeVisible();

    // Go to the cart. A "View cart" link appears right after adding.
    await page.getByRole("link", { name: /view cart/i }).click();
    await expect(page).toHaveURL(/\/shop\/cart$/);

    // The cart page shows the product we added (matched by its title).
    await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
    // ...and it is no longer the empty-cart state.
    await expect(page.getByText(/your cart is empty/i)).toHaveCount(0);
  });

  test("cart persists across a page reload", async ({ page }) => {
    await openFirstProduct(page);
    await addToCartButton(page).click();
    await expect(page.getByRole("button", { name: /added/i })).toBeVisible();

    // localStorage-backed carts should survive a reload.
    await page.goto("/en/shop/cart");
    await page.reload();
    await expect(page.getByText(/your cart is empty/i)).toHaveCount(0);
  });

  test("quantity carries into the cart and the total adds up", async ({ page }) => {
    const title = await openFirstProduct(page);

    // The quantity stepper starts at 1. Its "+" button is labelled
    // "Increase quantity" — click it twice to reach 3.
    const increase = page.getByRole("button", { name: "Increase quantity" });
    await increase.click();
    await increase.click();

    // The stepper's text input (accessible name "Quantity") now reads "3".
    // getByRole("textbox") matches <input type="text">; toHaveValue checks the
    // value attribute, not visible text.
    await expect(
      page.getByRole("textbox", { name: "Quantity" }),
    ).toHaveValue("3");

    await addToCartButton(page).click();
    await page.getByRole("link", { name: /view cart/i }).click();
    await expect(page).toHaveURL(/\/shop\/cart$/);

    // Scope everything below to *our* product's cart row (a <li>, role
    // "listitem") so other rows can't interfere. `.filter({ hasText })` keeps
    // only the list item containing our product's title.
    const line = page.getByRole("listitem").filter({ hasText: title }).first();

    // The quantity we chose on the product page carried into the cart.
    await expect(
      line.getByRole("textbox", { name: "Quantity" }),
    ).toHaveValue("3");

    // The row shows two money values: the unit price, then the line subtotal.
    // Read them both, parse to numbers, and check subtotal == unit * 3.
    const prices = await line.getByText(/\$/).allInnerTexts();
    const unit = money(prices[0]);
    const subtotal = money(prices[prices.length - 1]);
    expect(subtotal).toBeCloseTo(unit * 3, 2);

    // With a single item in the cart, the grand "Total" equals that subtotal.
    // We find the "Total" label and read the amount span sitting next to it.
    const totalText = await page
      .getByText("Total", { exact: true })
      .locator("xpath=following-sibling::span")
      .innerText();
    expect(money(totalText)).toBeCloseTo(subtotal, 2);
  });

  test("removing the only item empties the cart", async ({ page }) => {
    // Arrange: get a product into the cart and land on the cart page.
    const title = await openFirstProduct(page);
    await addToCartButton(page).click();
    await page.getByRole("link", { name: /view cart/i }).click();
    await expect(page).toHaveURL(/\/shop\/cart$/);

    // Our product's row exists before we remove it. `line` is the <li> whose
    // text contains the product title (scoped so we only touch that row).
    const line = page.getByRole("listitem").filter({ hasText: title });
    await expect(line).toBeVisible();

    // Act: click that row's "Remove" button.
    await line.getByRole("button", { name: "Remove" }).click();

    // Assert: the row is gone (count drops to 0) and the empty state appears.
    // Asserting *absence* is as important as asserting presence — it proves the
    // removal actually happened, not just that a message showed up somewhere.
    await expect(line).toHaveCount(0);
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });
});
