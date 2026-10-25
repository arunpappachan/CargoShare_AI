import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const APP_URL = 'http://localhost:5173';

/**
 * Creates and returns a Selenium WebDriver instance.
 */
export async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1920,1080');
  
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

/**
 * Ensure the test users exist in the DB by calling the register endpoint directly.
 */
export async function seedTestUsers() {
  const users = [
    { email: 'admin2@test.com', password: 'password123', name: 'Admin User', role: 'admin' },
    { email: 'exporter@test.com', password: 'password123', name: 'Exporter User', role: 'exporter' },
    { email: 'carrier@test.com', password: 'password123', name: 'Carrier User', role: 'carrier' }
  ];

  for (const u of users) {
    try {
      await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...u, companyName: 'TestCo', phone: '1234567890', region: 'global' })
      });
    } catch (e) {
      // Ignore if it fails or already exists
    }
  }
}

/**
 * Helper to log in to the application and wait until redirect.
 */
export async function loginAs(driver, email, password) {
  await seedTestUsers(); // Ensure they exist before logging in

  await driver.get(`${APP_URL}/login`);
  
  const emailInput = await driver.wait(until.elementLocated(By.id('email')), 5000);
  await emailInput.sendKeys(email);
  
  const passInput = await driver.findElement(By.id('password'));
  await passInput.sendKeys(password);
  
  // Submit
  const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
  await submitBtn.click();
  
  // Wait for the URL to change (meaning login was successful and we navigated away)
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url !== `${APP_URL}/login`;
  }, 10000);
}

export { APP_URL };
