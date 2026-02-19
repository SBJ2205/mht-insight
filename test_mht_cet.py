from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_percentile_input():
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    driver.get("http://localhost:5000")
    time.sleep(4) # Wait for API/Cities to load

    # 1. Enter Percentile
    percentile_field = driver.find_element(By.ID, "percentile")
    percentile_field.send_keys("95.5")
    
    # 2. Find the Submit Button
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    # 3. Use JavaScript to click (This avoids 'ElementClickIntercepted')
    driver.execute_script("arguments[0].click();", submit_button)
    
    # 4. Wait for the ML model to respond
    time.sleep(5)
    
    # 5. Verification: Check if we moved to the search page
    assert "/search" in driver.current_url or driver.current_url != "http://localhost:5000/"
    
    print("Test Passed: Form submitted successfully via Selenium!")
    driver.quit()
