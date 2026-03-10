pipeline {
    agent any 
    environment {
        IMAGE_NAME = "mht-cet-app"
        CONTAINER_NAME = "mht-container"
        PORT = "5000"
    }
    stages {
        stage('Build Docker Image') {
            steps {
                // Build the image from the Dockerfile [cite: 152, 215]
                bat "docker build -t mht-cet-app ."
            }
        }
        stage('Deploy to Container') {
            steps {
                // Stop and remove old container if it exists [cite: 220, 222]
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    bat "docker stop mht-container"
                    bat "docker rm mht-container"
                }
                // Run the new container in detached mode [cite: 158, 225]
                bat "docker run -d -p 5000:5000 --name mht-container mht-cet-app"
            }
        }
    }
}
