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

  it('should be able to view Fraud alerts and telemetry table', async function () {
    await driver.get(`${APP_URL}/dashboard/admin`);
    
    const fraudTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Fraud')]")), 5000);
    await fraudTab.click();

    // Verify Fraud detection heading
    const heading = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Fraud Detection')]")), 5000);
    expect(await heading.isDisplayed()).to.be.true;

    // Verify alert records in table
    const tableEl = await driver.wait(until.elementLocated(By.xpath("//td[contains(., 'TechFreight SME')]")), 5000);
    expect(await tableEl.isDisplayed()).to.be.true;

    const alertType = await driver.findElement(By.xpath("//td[contains(., 'Suspicious IP Login')]"));
    expect(await alertType.isDisplayed()).to.be.true;
  });
});
