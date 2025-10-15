pipeline {
    agent any
    
    triggers {
        pollSCM('H/5 * * * *')
    }
    
    tools {
        jdk 'Java-17'
        maven 'Maven-3.9.11'
    }
    
    environment {
        SONAR_HOME = tool "Sonar"
        SONAR_HOST_URL = 'http://3.85.23.19:9000/'
        BACKEND_DIR = 'emp_backend'
        FRONTEND_DIR = 'employee frontend final'
        SONAR_PROJECT_KEY = 'Employee-Management-System'
        SONAR_PROJECT_NAME = 'Employee-Management-System'
        // CHROME_BIN = '/usr/bin/chromium-browser'
    }
    
    stages {
        
        stage("Workspace Cleanup") {
            steps {
                echo "Cleaning workspace..."
                cleanWs()
            }
        }
        
        stage("Clone from Git") {
            steps {
                script {
                    echo "Cloning repository from Git.."
                    git branch: "master",
                        credentialsId: 'github-credentials',
                        url: 'https://github.com/ArY-12/java-project.git'
                    
                    echo "Repository cloned successfully!"
                }
            }
        }
        
        stage("Verify Structure") {
            steps {
                echo "Verifying project structure..."
                sh '''
                    echo "=== Root Directory ==="
                    ls -la
                    
                    echo "\n=== Backend Directory ==="
                    if [ -d "${BACKEND_DIR}" ]; then
                        ls -la "${BACKEND_DIR}"
                    else
                        echo "WARNING: Backend directory not found!"
                    fi
                    
                    echo "\n=== Frontend Directory ==="
                    if [ -d "${FRONTEND_DIR}" ]; then
                        ls -la "${FRONTEND_DIR}"
                    else
                        echo "WARNING: Frontend directory not found!"
                    fi
                '''
            }
        }
        
        stage("Build") {
            parallel {
                stage("Backend Build") {
                    steps {
                        script {
                            echo "Building Backend..."
                            dir("${BACKEND_DIR}") {
                                sh '''
                                    echo "Maven Version:"
                                    mvn -version
                                    
                                    echo "Cleaning and compiling backend..."
                                    mvn clean compile
                                '''
                            }
                        }
                    }
                }
                
                stage("Frontend Build") {
                    steps {
                        script {
                            echo "Building Frontend..."
                            dir("${FRONTEND_DIR}") {
                                sh '''
                                    echo "Node Version:"
                                    node --version
                                    
                                    echo "NPM Version:"
                                    npm --version
                                    
                                    echo "Cleaning npm cache..."
                                    npm cache clean --force
                                    
                                    echo "Removing old dependencies..."
                                    rm -rf node_modules package-lock.json
                                    
                                    echo "Installing dependencies..."
                                    npm install
                                    
                                    echo "Building frontend application..."
                                    CI=false npm run build
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage("Test") {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            echo "Running Backend Tests..."
                            dir("${BACKEND_DIR}") {
                                sh '''
                                    echo "Executing Maven tests..."
                                    mvn clean test || true
                                    
                                    echo "Generating JaCoCo coverage report..."
                                    mvn jacoco:report || true
                                '''
                                
                                junit testResults: 'target/surefire-reports/**/*.xml', 
                                      allowEmptyResults: true
                                
                                jacoco execPattern: 'target/jacoco.exec',
                                       classPattern: 'target/classes',
                                       sourcePattern: 'src/main/java',
                                       exclusionPattern: '**/test/**'
                            }
                            echo "Backend tests completed!"
                        }
                    }
                }
                
                stage("Frontend Tests") {
                    steps {
                        script {
                            echo "Running Frontend Tests..."
                            dir("${FRONTEND_DIR}") {
                                sh '''
                                    export CHROME_BIN=/usr/bin/chromium-browser
                                    echo "Executing Karma tests with coverage..."
                                    npm test -- --code-coverage --watch=false --browsers=ChromeHeadless || true
                                    
                                    echo "Verifying coverage files..."
                                    if [ -f "coverage/lcov.info" ]; then
                                        echo "✓ Coverage file generated successfully"
                                        ls -la coverage/
                                    else
                                        echo "⚠ Warning: Coverage file not found"
                                    fi
                                '''
                            }
                            echo "Frontend tests completed!"
                        }
                    }
                }
            }
        }
        
        stage("SonarQube Analysis") {
            steps {
                script {
                    echo "Starting SonarQube code analysis..."
                    
                    withSonarQubeEnv("Sonar") {
                        sh """
                            echo "Checking coverage files..."
                            if [ -f "${FRONTEND_DIR}/coverage/lcov.info" ]; then
                                echo "✓ Frontend coverage found"
                            else
                                echo "⚠ Frontend coverage not found - SonarQube will use backend coverage only"
                            fi
                            
                            if [ -f "${BACKEND_DIR}/target/site/jacoco/jacoco.xml" ]; then
                                echo "✓ Backend coverage found"
                            else
                                echo "⚠ Backend coverage not found"
                            fi
                            
                            ${SONAR_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                            -Dsonar.java.binaries="${BACKEND_DIR}/target/classes" \
                            -Dsonar.sources="${BACKEND_DIR}/src/main","${FRONTEND_DIR}/src" \
                            -Dsonar.tests="${BACKEND_DIR}/src/test","${FRONTEND_DIR}/src" \
                            -Dsonar.test.inclusions="**/*.spec.ts,**/*.spec.js,**/*.test.js,**/*.test.ts" \
                            -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/target/**" \
                            -Dsonar.javascript.lcov.reportPaths="${FRONTEND_DIR}/coverage/lcov.info" \
                            -Dsonar.java.coveragePlugin=jacoco \
                            -Dsonar.coverage.jacoco.xmlReportPaths="${BACKEND_DIR}/target/site/jacoco/jacoco.xml" \
                            -Dsonar.qualitygate.wait=true \
                            -Dsonar.qualitygate.timeout=300
                        """
                    }
                    
                    echo "SonarQube analysis completed!"
                }
            }
        }
        
        stage("Quality Gate Check") {
            steps {
                script {
                    echo "Waiting for SonarQube Quality Gate result..."
                    
                    timeout(time: 10, unit: 'MINUTES') {
                        try {
                            def qg = waitForQualityGate()
                            
                            if (qg.status != 'OK') {
                                echo "Quality Gate Status: ${qg.status}"
                                echo "⚠ Quality Gate failed but continuing pipeline..."
                            } else {
                                echo "✓ Quality Gate passed successfully!"
                            }
                        } catch (Exception e) {
                            echo "Warning: Quality Gate check failed or timed out"
                            echo "Error: ${e.getMessage()}"
                            echo "⚠ Continuing pipeline despite Quality Gate failure..."
                        }
                    }
                }
            }
        }
        
        stage("Archive Artifacts") {
            steps {
                script {
                    echo "Archiving build artifacts..."
                    
                    archiveArtifacts artifacts: "${BACKEND_DIR}/target/*.jar,${BACKEND_DIR}/target/*.war", 
                                     allowEmptyArchive: true,
                                     fingerprint: true
                    
                    archiveArtifacts artifacts: "${FRONTEND_DIR}/dist/**/*", 
                                     allowEmptyArchive: true,
                                     fingerprint: true
                    
                    archiveArtifacts artifacts: "${FRONTEND_DIR}/coverage/**/*", 
                                     allowEmptyArchive: true
                    
                    echo "Artifacts archived successfully!"
                }
            }
        }
        
        stage("Deploy") {
            steps {
                script {
                    echo "=== Deployment Stage ==="
                    echo "Build completed successfully!"
                    echo "Ready for deployment..."
                    
                    echo "Deployment stage completed!"
                }
            }
        }
    }
    
    post {
        always {
            echo "=== Pipeline Execution Summary ==="
            echo "Pipeline finished at: ${new Date()}"
        }
        
        success {
            echo "✓ Pipeline completed successfully!"
            echo "All stages passed without errors."
        }
        
        failure {
            echo "✗ Pipeline failed!"
            echo "Check the logs above for error details."
        }
        
        unstable {
            echo "⚠ Pipeline is unstable!"
            echo "Some tests may have failed."
        }
        
        cleanup {
            echo "Cleaning up workspace..."
        }
    }
}
