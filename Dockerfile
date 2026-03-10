# Step 1: Use a lightweight Python base image [cite: 215]
FROM python:3.13-slim

# Step 2: Set the working directory inside the container [cite: 215]
WORKDIR /app

# Step 3: Copy requirements and install them [cite: 215]
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 4: Copy the rest of your MHT-CET project code [cite: 215]
COPY . .

# Step 5: Inform Docker the app runs on port 5000 [cite: 215]
EXPOSE 5000

# Step 6: Command to start your Flask app [cite: 215]
CMD ["python", "app.py"]
