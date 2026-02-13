from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_home_page():
    # This opens the local Chrome browser
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    # Navigate to your local or AWS deployed site
    # Use localhost:8501 if you are running Streamlit locally
    driver.get("http://localhost:8501") 
    time.sleep(2)

    # Verification: Check for your specific heading
    assert "MHT-CET" in driver.page_source
    
    print("Test Passed: MHT-CET Page loaded successfully!")
    driver.quit()
