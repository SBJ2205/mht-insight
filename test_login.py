from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_login():
    driver = webdriver.Chrome()
    driver.maximize_window()

    # Navigates to the practice site
    driver.get("https://practicetestautomation.com/practice-test-login/")

    # Locates elements and performs login
    driver.find_element(By.ID, "username").send_keys("student")
    driver.find_element(By.ID, "password").send_keys("Password123")
    driver.find_element(By.ID, "submit").click()
    time.sleep(3)

    # Assertion to verify success
    assert "Logged In Successfully" in driver.page_source
    driver.quit()
