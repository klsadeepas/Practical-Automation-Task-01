import { test, expect } from '@playwright/test';

test.describe('Stable Product Cart & Checkout Automation Suite', () => {
  const baseUrl = 'https://www.saucedemo.com/';

  const user = {
    username: 'standard_user',
    password: 'secret_sauce',
  };

  const customer = {
    firstName: 'Codezela',
    lastName: 'QA',
    postalCode: '00100',
  };

  const productName = 'Sauce Labs Backpack';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);

    await page.locator('[data-test="username"]').fill(user.username);
    await page.locator('[data-test="password"]').fill(user.password);
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('Complete cart and checkout validation flow', async ({ page }) => {
    await expect(page.locator('.inventory_list')).toBeVisible();

    const addToCartButton = page
      .locator('.inventory_item')
      .filter({ hasText: productName })
      .locator('button');

    await addToCartButton.click();

    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');

    await page.locator('.shopping_cart_link').click();

    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.inventory_item_name')).toHaveText(productName);

    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('.cart_item')).toHaveCount(0);
    await expect(cartBadge).toHaveCount(0);

    await page.locator('[data-test="continue-shopping"]').click();

    await addToCartButton.click();

    await expect(cartBadge).toHaveText('1');

    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    await expect(page).toHaveURL(/checkout-step-one/);

    await page.locator('[data-test="continue"]').click();

    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Error: First Name is required');

    await page.locator('[data-test="firstName"]').fill(customer.firstName);
    await page.locator('[data-test="lastName"]').fill(customer.lastName);
    await page.locator('[data-test="postalCode"]').fill(customer.postalCode);

    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/checkout-step-two/);

    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/checkout-complete/);
    await expect(page.locator('.complete-header')).toHaveText(
      'Thank you for your order!'
    );
  });
});
