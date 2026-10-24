import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, APP_URL, loginAs } from './helpers.js';

describe('Admin Dashboard E2E', function () {
  let driver;

  before(async function () {
    driver = await createDriver();
    // Assuming backend is seeded with admin@test.com / password123
    try {
      await loginAs(driver, 'admin2@test.com', 'password123');
    } catch (e) {
      console.warn('Login failed, tests might fail if protected.', e);
    }
  });

  after(async function () {
    await driver.quit();
  });

  it('should verify Admin dashboard sidebar', async function () {
    await driver.get(`${APP_URL}/dashboard/admin`);
    
    // Check if sidebar has 'System Overview' tab
    const overviewTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Overview')]")), 10000);
    expect(await overviewTab.isDisplayed()).to.be.true;

    // Check if 'Users' or 'Carrier Manager' tab exists
    const usersTab = await driver.findElement(By.xpath("//button[contains(., 'Carrier')]"));
    expect(await usersTab.isDisplayed()).to.be.true;

    // Check if 'Fraud' tab exists
    const fraudTab = await driver.findElement(By.xpath("//button[contains(., 'Fraud')]"));
    expect(await fraudTab.isDisplayed()).to.be.true;
  });

  it('should be able to log and view Fraud alerts', async function () {
    await driver.get(`${APP_URL}/dashboard/admin`);
    
    const fraudTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Fraud')]")), 5000);
    await fraudTab.click();

    // Wait for the fraud component to mount (it should have 'Log Alert' button)
    const logBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Log Alert')]")), 5000);
    expect(await logBtn.isDisplayed()).to.be.true;

    await logBtn.click();

    // Fill form
    // Note: The inputs don't have IDs but they are the only inputs on the form, we can find them by index or label
    // User/Company is the first input, Alert Type is the second
    const inputs = await driver.findElements(By.css('input[type="text"]'));
    if (inputs.length >= 2) {
      await inputs[0].sendKeys('Test Malicious Exporter');
      await inputs[1].sendKeys('Suspicious IP location');
    }

    const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Save Alert')]"));
    await saveBtn.click();

    // Verify it appears in the table
    const tableEl = await driver.wait(until.elementLocated(By.xpath("//td[contains(., 'Test Malicious Exporter')]")), 5000);
    expect(await tableEl.isDisplayed()).to.be.true;
  });
});
