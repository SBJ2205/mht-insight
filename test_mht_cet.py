from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_home_page():
    # This opens the local Chrome browser
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    # Point to the default Streamlit port
    driver.get("http://localhost:8501") 
    
    # Wait for the UI to render
    time.sleep(5) 

    # Verification: 'College' is a safe keyword for your project
    assert "College" in driver.page_source
    
    print("Test Passed: MHT-CET Page is live!")
    driver.quit()
