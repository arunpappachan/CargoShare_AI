import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { loginAs } from './tests/e2e/helpers.js';

async function run() {
  const options = new chrome.Options();
  const driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();
  
  try {
    await loginAs(driver, 'carrier@test.com', 'password123');
    await driver.get('http://localhost:5173/dashboard/carrier');
    
    const postTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Post Space')]")), 5000);
    await postTab.click();

    const originSelect = await driver.wait(until.elementLocated(By.css('select:nth-of-type(1)')), 5000);
    await originSelect.sendKeys('Mundra');
    
    const val = await originSelect.getAttribute('value');
    console.log("Origin value after sendKeys('Mundra'):", val);
    
  } finally {
    await driver.quit();
  }
}

run();
