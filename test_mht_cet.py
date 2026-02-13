from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_home_page():
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    # Point to the default Streamlit port
    driver.get("http://localhost:8501") 
    
    # Wait for the ML model and UI to render
    time.sleep(5) 

    # Verification: 'College' is a safe keyword for your project
    assert "College" in driver.page_source [cite: 222, 241]
    
    print("Test Passed: MHT-CET Page is live!")
    driver.quit() [cite: 223, 242]
