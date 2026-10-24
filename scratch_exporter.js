import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { loginAs } from './tests/e2e/helpers.js';
import fs from 'fs';

async function run() {
  const options = new chrome.Options();
  const driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();
  
  try {
    await loginAs(driver, 'exporter@test.com', 'password123');
    await driver.get('http://localhost:5173/dashboard/exporter');
    
    // Search Space
    const searchTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Search Space')]")), 5000);
    await searchTab.click();

    const originSelect = await driver.wait(until.elementLocated(By.css('select:nth-of-type(1)')), 5000);
    await originSelect.sendKeys('Mumbai');

    const destSelect = await driver.findElement(By.xpath("(//select)[2]"));
    await destSelect.sendKeys('Mundra');

    const dateInput = await driver.findElement(By.css('input[type="date"]'));
    await driver.executeScript(`
      const input = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '2028-09-01');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `, dateInput);

    const cbmInput = await driver.findElement(By.css('input[placeholder="CBM"]'));
    await cbmInput.sendKeys('50');

    const searchBtn = await driver.findElement(By.xpath("//button[contains(., 'Search')]"));
    await searchBtn.click();

    await driver.sleep(2000); // give it time to load results
    
    const results = await driver.findElement(By.css('body')).getAttribute('innerHTML');
    fs.writeFileSync('C:/Project/CargoShare_AI/body.html', results);
    console.log("BODY HTML saved!");

  } finally {
    await driver.quit();
  }
}

run();
