import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, APP_URL } from './helpers.js';

describe('Authentication E2E', function () {
  let driver;

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    await driver.quit();
  });

  it('should display the login form and have standard elements', async function () {
    await driver.get(`${APP_URL}/login`);
    
    const emailField = await driver.wait(until.elementLocated(By.id('email')), 5000);
    const passwordField = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    
    expect(await emailField.isDisplayed()).to.be.true;
    expect(await passwordField.isDisplayed()).to.be.true;
    expect(await submitBtn.isDisplayed()).to.be.true;
  });

  it('should be able to toggle to the registration page', async function () {
    await driver.get(`${APP_URL}/login`);
    const registerLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/register')]")), 5000);
    await registerLink.click();

    // Wait until url changes
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/register');
    }, 5000);

    const nameField = await driver.wait(until.elementLocated(By.id('name')), 5000);
    expect(await nameField.isDisplayed()).to.be.true;
  });

  it('should successfully log in and redirect to dashboard', async function () {
    await driver.get(`${APP_URL}/login`);
    const emailField = await driver.wait(until.elementLocated(By.id('email')), 5000);
    await emailField.sendKeys('exporter@test.com');
    
    const passwordField = await driver.findElement(By.id('password'));
    await passwordField.sendKeys('password123');
    
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    // Wait for redirect
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/dashboard');
    }, 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/dashboard/exporter');
  });
});
