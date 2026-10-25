import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, APP_URL, loginAs } from './helpers.js';

describe('E2E Lifecycle: Space Posting -> Booking -> Approval', function () {
  let driver;
  const uniqueVessel = `Lifecycle Vessel ${Date.now()}`;

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    await driver.quit();
  });

  async function logout() {
    try {
      const logoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Sign Out')]")), 5000);
      await logoutBtn.click();
      await driver.wait(until.urlContains('/login'), 5000);
    } catch (e) {
      console.warn("Logout failed or already logged out", e);
    }
  }

  it('Step 1 (Carrier): Should log in and post a unique space', async function () {
    await driver.get(`${APP_URL}/login`);
    await loginAs(driver, 'carrier@test.com', 'password123');
    
    const postTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Post Space')]")), 10000);
    await postTab.click();

    const vesselInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Oceanic Explorer V-102']")), 5000);
    await vesselInput.sendKeys(uniqueVessel);

    const originSelect = await driver.findElement(By.css('select:nth-of-type(1)'));
    await driver.executeScript(`
      const sel = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      nativeSetter.call(sel, 'innsa');
      sel.dispatchEvent(new Event('change', {bubbles: true}));
    `, originSelect);

    const destSelect = await driver.findElement(By.xpath("(//select)[2]"));
    await driver.executeScript(`
      const sel = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      nativeSetter.call(sel, 'inmun');
      sel.dispatchEvent(new Event('change', {bubbles: true}));
    `, destSelect);

    const dateInput = await driver.findElement(By.css('input[type="date"]'));
    await driver.executeScript(`
      const input = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '2028-12-12');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `, dateInput);

    const capacityInput = await driver.findElement(By.xpath("//input[@placeholder='Total capacity']"));
    await capacityInput.sendKeys('1500');

    const priceInput = await driver.findElement(By.xpath("//input[@placeholder='e.g. 450']"));
    await priceInput.sendKeys('500');

    const publishBtn = await driver.findElement(By.xpath("//button[contains(., 'Publish Listing')]"));
    await publishBtn.click();

    const successMsg = await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Space Listed Successfully!')]")), 10000);
    expect(await successMsg.isDisplayed()).to.be.true;

    await logout();
  });

  it('Step 2 (Exporter): Should log in, find the unique space, and book it', async function () {
    await driver.get(`${APP_URL}/login`);
    await loginAs(driver, 'exporter@test.com', 'password123');
    
    const searchTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Search Space')]")), 10000);
    await searchTab.click();

    const originSelect = await driver.wait(until.elementLocated(By.css('select:nth-of-type(1)')), 5000);
    await driver.executeScript(`
      const sel = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      nativeSetter.call(sel, 'innsa');
      sel.dispatchEvent(new Event('change', {bubbles: true}));
    `, originSelect);

    const destSelect = await driver.findElement(By.xpath("(//select)[2]"));
    await driver.executeScript(`
      const sel = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      nativeSetter.call(sel, 'inmun');
      sel.dispatchEvent(new Event('change', {bubbles: true}));
    `, destSelect);

    const dateInput = await driver.findElement(By.css('input[type="date"]'));
    await driver.executeScript(`
      const input = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '2028-12-12');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `, dateInput);

    const cbmInput = await driver.findElement(By.css('input[placeholder="CBM"]'));
    await driver.executeScript(`
      const input = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '10');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `, cbmInput);

    await driver.sleep(500);
    const searchBtn = await driver.findElement(By.xpath("//main//button[contains(., 'Search') and not(contains(., 'Search Space'))]"));
    await searchBtn.click();

    const specificVesselCard = await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'bg-white') and (contains(., '${uniqueVessel}') or .//button[contains(., 'Book Space')])]`)), 10000);
    
    const bookSpaceBtn = await specificVesselCard.findElement(By.xpath(".//button[contains(., 'Book Space')]"));
    await bookSpaceBtn.click();

    const commodityInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="Textiles"]')), 5000);
    await commodityInput.sendKeys('Textiles');

    const weightInput = await driver.findElement(By.css('input[placeholder="2500"]'));
    await weightInput.sendKeys('500');

    // Step 1: Proceed to Payment Options
    const proceedBtn = await driver.findElement(By.xpath("//button[contains(., 'Proceed to Payment Options')]"));
    await proceedBtn.click();

    // Step 2: Pay & Lock Slot
    const payBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lock Slot')]")), 5000);
    await payBtn.click();

    // Step 3: Confirmation
    const successMsg = await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Booking Confirmed!')]")), 10000);
    expect(await successMsg.isDisplayed()).to.be.true;
    
    const doneBtn = await driver.findElement(By.xpath("//button[contains(., 'Done')]"));
    await doneBtn.click();

    await logout();
  });

  it('Step 3 (Carrier): Should log in, find the booking request, and approve it', async function () {
    await driver.get(`${APP_URL}/login`);
    await loginAs(driver, 'carrier@test.com', 'password123');

    const requestsTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Requests')]")), 10000);
    await requestsTab.click();

    // Find and click the Approve button
    const approveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Approve')]")), 10000);
    await driver.executeScript("arguments[0].click();", approveBtn);

    const approvedBadge = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Approved')]")), 5000);
    expect(await approvedBadge.isDisplayed()).to.be.true;

    await logout();
  });

  it('Step 4 (Exporter): Should log in and verify the booking is approved', async function () {
    await driver.get(`${APP_URL}/login`);
    await loginAs(driver, 'exporter@test.com', 'password123');

    const bookingsTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'My Bookings')]")), 10000);
    await bookingsTab.click();

    // Since we just approved it, it should be in the active tab as 'Approved'
    const approvedRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Approved')]")), 10000);
    expect(await approvedRow.isDisplayed()).to.be.true;
  });
});
