from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

def test_percentile_input():
    # 1. Setup the Chrome driver
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    # 2. Navigate to your local Flask app
    driver.get("http://localhost:5000")
    time.sleep(3) # Wait for page to load completely

    # 3. Locate the 'Percentile' input field by its ID
    # Based on your HTML: <input id="percentile" name="percentile">
    percentile_field = driver.find_element(By.ID, "percentile")
    
    # 4. Enter a test value
    percentile_field.send_keys("95.5")
    
    # 5. Locate and click the 'Get Recommendations' button
    # Based on your HTML, it is the only button with type="submit"
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()
    
    # 6. Wait for results to process
    time.sleep(5)
    
    # 7. Verification: Check if the browser moved to the search results
    # or if the page source reflects a change
    assert driver.current_url != "http://localhost:5000/"
    
    print("Test Passed: Percentile input and submit button are functional!")
    driver.quit()
