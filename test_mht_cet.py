from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_home_page():
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    # 1. Point to your local Flask app port (usually 5000)
    # If you are running locally, it is http://localhost:5000
    driver.get("http://localhost:5000") 
    
    # 2. Give the Bootstrap styles time to load
    time.sleep(5) 

    # 3. Targeted Assertion: Check for the exact H1 heading in your index.html
    heading = driver.find_element(By.TAG_NAME, "h1").text
    assert "ML-Powered College Finder" in heading
    
    # 4. Secondary Verification: Check for the ML badge text
    assert "K-Means Clustering" in driver.page_source
    
    print("Functional Test Passed: MHT-CET ML-Powered College Finder is live!")
    driver.quit()
