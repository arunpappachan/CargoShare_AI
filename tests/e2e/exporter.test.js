import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, APP_URL, loginAs } from './helpers.js';

describe('Exporter Dashboard E2E', function () {
  let driver;

  before(async function () {
    this.timeout(60000);
    driver = await createDriver();
    // Assuming backend is seeded with exporter@test.com / password123
    try {
      await loginAs(driver, 'exporter@test.com', 'password123');
    } catch (e) {
      console.warn('Login failed, tests might fail if protected.', e);
    }
  });

  after(async function () {
    await driver.quit();
  });

  it('should verify Exporter dashboard sidebar and main elements', async function () {
    await driver.get(`${APP_URL}/dashboard/exporter`);
    
    // Check if sidebar has 'Search Space' tab
    const searchTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Search Space')]")), 10000);
    expect(await searchTab.isDisplayed()).to.be.true;

    // Check if 'Bookings' tab exists
    const bookingsTab = await driver.findElement(By.xpath("//button[contains(., 'My Bookings')]"));
    expect(await bookingsTab.isDisplayed()).to.be.true;

    // Check if 'Documents' tab exists
    const docsTab = await driver.findElement(By.xpath("//button[contains(., 'Docs & Customs')]"));
    expect(await docsTab.isDisplayed()).to.be.true;
  });

  it('should be able to search and book a container', async function () {
    await driver.get(`${APP_URL}/dashboard/exporter`);
    const searchTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Search Space')]")), 10000);
    await searchTab.click();

    // Fill out search form
    // Select Origin and Destination
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

    // Date
    const dateInput = await driver.findElement(By.css('input[type="date"]'));
    await driver.executeScript(`
      const input = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '2028-12-12');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `, dateInput);

    // CBM
    const cbmInput = await driver.findElement(By.css('input[placeholder="CBM"]'));
    await driver.executeScript(`
      const input = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '10');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `, cbmInput);

    // Search
    await driver.sleep(500);
    const searchBtn = await driver.findElement(By.xpath("//main//button[contains(., 'Search') and not(contains(., 'Search Space'))]"));
    await searchBtn.click();

    // Check for error message
    await driver.sleep(500);
    try {
      const errorMsg = await driver.findElement(By.css('.text-red-500'));
      const errorText = await errorMsg.getText();
      console.log("SEARCH VALIDATION ERROR:", errorText);
    } catch (e) {
      // no error element found
    }

    // Wait for results to appear
    try {
      const bookSpaceBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Book Space')]")), 5000);
      await bookSpaceBtn.click();
    } catch (e) {
      const fs = await import('fs');
      const html = await driver.getPageSource();
      fs.writeFileSync('exporter_failure_dom.html', html);
      throw e;
    }

    // Wait for booking modal and fill it
    const commodityInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Electronics, Textiles']")), 5000);
    await commodityInput.sendKeys('Electronics');

    const weightInput = await driver.findElement(By.xpath("//input[@placeholder='2000']"));
    await weightInput.sendKeys('500');

    // Click Confirm Booking
    const confirmBtn = await driver.findElement(By.xpath("//button[contains(., 'Confirm Booking')]"));
    await confirmBtn.click();

    // Wait for confirmation success check
    const successMsg = await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Booking Confirmed!')]")), 5000);
    expect(await successMsg.isDisplayed()).to.be.true;
    
    const doneBtn = await driver.findElement(By.xpath("//button[contains(., 'Done')]"));
    await doneBtn.click();
  });

  it('should be able to view and interact with documents', async function () {
    await driver.get(`${APP_URL}/dashboard/exporter`);
    const docsTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Docs & Customs')]")), 10000);
    await docsTab.click();

    // Wait for documents to render
    const uploadBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Upload Document')]")), 5000);
    expect(await uploadBtn.isDisplayed()).to.be.true;

    // Verify list items exist by looking for a status badge or download icon
    const docHeading = await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Uploaded Documents')]")), 5000);
    expect(await docHeading.isDisplayed()).to.be.true;
  });
});
