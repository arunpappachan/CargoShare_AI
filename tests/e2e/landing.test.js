import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, APP_URL } from './helpers.js';

describe('Landing Page E2E', function () {
  let driver;

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    await driver.quit();
  });

  it('should load the homepage and check title', async function () {
    await driver.get(APP_URL);
    
    // Wait for the main heading to ensure page has rendered
    await driver.wait(until.elementLocated(By.tagName('h1')), 5000);
    const title = await driver.getTitle();
    expect(title.toLowerCase()).to.include('cargoshare'); 
  });

  it('should have functional navigation buttons', async function () {
    await driver.get(APP_URL);

    // Look for login link/button in navbar
    const loginBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/login')]")), 5000);
    expect(await loginBtn.isDisplayed()).to.be.true;

    // Look for Get Started button
    const getStartedBtn = await driver.findElement(By.xpath("//a[contains(@href, '/register')]"));
    expect(await getStartedBtn.isDisplayed()).to.be.true;
  });
});
