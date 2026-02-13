from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_home_page():
    # This opens the local Chrome browser
    driver = webdriver.Chrome() 
    driver.maximize_window() [cite: 1160, 1185]

    # Navigate to your local or AWS deployed site
    driver.get("http://localhost:8080") # Or your AWS IP 
    time.sleep(2) [cite: 1171]

    # Verification: Check for your specific heading
    assert "College Finder" in driver.page_source [cite: 1173, 1192]
    
    print("Test Passed: MHT-CET Page loaded successfully!")
    driver.quit() [cite: 1174, 1193]
