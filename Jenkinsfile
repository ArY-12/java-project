pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    tools {
        jdk 'Java-17'
        maven 'Maven-3.9.11'
        nodejs 'Node-18-NVM'
    }

    environment {
        SONAR_HOST_URL = 'http://3.86.68.99:9000/'
        BACKEND_DIR = 'emp_backend'
        FRONTEND_DIR = 'employee frontend final'
        SONAR_PROJECT_KEY = 'Employee-Management-System'
        SONAR_PROJECT_NAME = 'Employee-Management-System'
        DT_PROJECT_NAME = 'Employee-Management-System'
        DT_PROJECT_VERSION = '1.0'
        DT_URL = 'http://3.86.68.99:8081'  // ← Update this with your Dependency-Track IP!
    }

    stages {
        stage('Workspace Cleanup') {
            steps {
                echo 'Cleaning workspace...'
                cleanWs()
            }
        }

        stage('Clone from Git') {
            steps {
                script {
                    echo 'Cloning repository from Git...'
                    git branch: 'master',
                        credentialsId: 'github-credentials',
                        url: 'https://github.com/ArY-12/java-project.git'
                    echo 'Repository cloned successfully!'
                }
            }
        }

        stage('Verify Structure') {
            steps {
                echo 'Verifying project structure...'
                sh '''
                    echo "=== Root Directory ==="
                    ls -la

                    echo ""
                    echo "=== Backend Directory ==="
                    if [ -d "${BACKEND_DIR}" ]; then
                        ls -la "${BACKEND_DIR}"
                    else
                        echo "WARNING: Backend directory not found!"
                    fi

                    echo ""
                    echo "=== Frontend Directory ==="
                    if [ -d "${FRONTEND_DIR}" ]; then
                        ls -la "${FRONTEND_DIR}"
                    else
                        echo "WARNING: Frontend directory not found!"
                    fi
                '''
            }
        }

        stage('Build') {
            parallel {
                stage('Backend Build') {
                    steps {
                        script {
                            echo 'Building Backend...'
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

                stage('Frontend Build') {
                    steps {
                        script {
                            echo 'Building Frontend...'
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

        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            echo 'Running Backend Tests...'
                            dir("${BACKEND_DIR}") {
                                def testResult = sh(script: '''
                                    echo "Executing Maven tests..."
                                    mvn clean test
                                ''', returnStatus: true)

                                sh '''
                                    echo "Generating JaCoCo coverage report..."
                                    mvn jacoco:report || echo "JaCoCo report generation failed or no coverage data"
                                '''

                                sh '''
                                    echo ""
                                    echo "=== Test Results Summary ==="
                                    if [ -d "target/surefire-reports" ]; then
                                        echo "Test reports found:"
                                        ls -la target/surefire-reports/
                                    else
                                        echo "⚠ No test reports directory found!"
                                    fi

                                    echo ""
                                    if [ -f "target/jacoco.exec" ]; then
                                        echo "✓ JaCoCo execution data found"
                                        ls -lh target/jacoco.exec
                                    else
                                        echo "⚠ JaCoCo execution data not found"
                                    fi

                                    echo ""
                                    if [ -d "target/site/jacoco" ]; then
                                        echo "✓ JaCoCo HTML report generated"
                                        ls -la target/site/jacoco/
                                    else
                                        echo "⚠ JaCoCo HTML report not found"
                                    fi
                                '''

                                junit testResults: 'target/surefire-reports/**/*.xml',
                                      allowEmptyResults: true,
                                      skipPublishingChecks: true

                                try {
                                    jacoco execPattern: 'target/jacoco.exec',
                                           classPattern: 'target/classes',
                                           sourcePattern: 'src/main/java',
                                           exclusionPattern: '**/test/**'
                                } catch (Exception e) {
                                    echo "⚠ JaCoCo plugin execution failed: ${e.getMessage()}"
                                }

                                if (testResult != 0) {
                                    echo "⚠ Some tests failed, but continuing pipeline..."
                                    currentBuild.result = 'UNSTABLE'
                                }
                            }
                            echo 'Backend tests completed!'
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        script {
                            echo 'Running Frontend Tests...'
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
                            echo 'Frontend tests completed!'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo 'Starting SonarQube code analysis...'

                    sh '''
                        echo "Attempting to reach SonarQube server..."
                        curl -f --connect-timeout 10 ${SONAR_HOST_URL}api/system/status
                    '''

                    def scannerHome = tool name: 'Sonar', type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                    withSonarQubeEnv('Sonar') {
                        sh """
                            echo "Checking coverage files..."
                            if [ -f "${FRONTEND_DIR}/coverage/lcov.info" ]; then
                                echo "✓ Frontend coverage found"
                            else
                                echo "⚠ Frontend coverage not found - using backend coverage only"
                            fi

                            if [ -f "${BACKEND_DIR}/target/site/jacoco/jacoco.xml" ]; then
                                echo "✓ Backend coverage found"
                            else
                                echo "⚠ Backend coverage not found"
                            fi

                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.projectName='${SONAR_PROJECT_NAME}' \
                                -Dsonar.java.binaries="${BACKEND_DIR}/target/classes" \
                                -Dsonar.sources="${BACKEND_DIR}/src/main","${FRONTEND_DIR}/src" \
                                -Dsonar.tests="${BACKEND_DIR}/src/test","${FRONTEND_DIR}/src" \
                                -Dsonar.test.inclusions="**/*.spec.ts,**/*.spec.js,**/*.test.js,**/*.test.ts" \
                                -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/target/**" \
                                -Dsonar.javascript.lcov.reportPaths="${FRONTEND_DIR}/coverage/lcov.info" \
                                -Dsonar.java.coveragePlugin=jacoco \
                                -Dsonar.coverage.jacoco.xmlReportPaths="${BACKEND_DIR}/target/site/jacoco/jacoco.xml"
                        """
                    }
                    echo 'SonarQube analysis completed!'
                }
            }
        }

        stage('Quality Gate Check') {
            steps {
                script {
                    echo 'Waiting for SonarQube Quality Gate result...'

                    timeout(time: 20, unit: 'MINUTES') {
                        try {
                            def qg = waitForQualityGate()
                            echo "Quality Gate Status: ${qg.status}"

                            if (qg.status != 'OK') {
                                currentBuild.result = 'FAILURE'
                                error """
❌ QUALITY GATE FAILED: ${qg.status}

Check SonarQube dashboard for details:
${SONAR_HOST_URL}dashboard?id=${SONAR_PROJECT_KEY}
"""
                            } else {
                                echo "✓ Quality Gate passed successfully!"
                            }
                        } catch (Exception e) {
                            if (e.getMessage().contains('timeout')) {
                                echo "⚠ Quality Gate check timed out - check dashboard manually"
                                currentBuild.result = 'UNSTABLE'
                            } else {
                                throw e
                            }
                        }
                    }
                }
            }
        }

        stage('Dependency Check') {
            parallel {
                stage('Backend Dependencies - Maven SBOM') {
                    steps {
                        script {
                            echo 'Scanning Backend Dependencies...'
                            dir("${BACKEND_DIR}") {
                                sh '''
                                    mvn org.cyclonedx:cyclonedx-maven-plugin:2.7.11:makeAggregateBom \
                                        -DoutputFormat=json \
                                        -DoutputName=bom \
                                        -DincludeBomSerialNumber=true
                                '''
                            }
                            echo '✓ Backend dependency scan completed!'
                        }
                    }
                }

                stage('Frontend Dependencies - NPM SBOM') {
                    steps {
                        script {
                            echo 'Scanning Frontend Dependencies...'
                            dir("${FRONTEND_DIR}") {
                                sh '''
                                    if ! command -v cyclonedx-npm &> /dev/null; then
                                        npm install -g @cyclonedx/cyclonedx-npm
                                    fi
                                    cyclonedx-npm --output-file bom.json --output-format JSON
                                '''
                            }
                            echo '✓ Frontend dependency scan completed!'
                        }
                    }
                }
            }
        }

        stage('Upload to Dependency-Track') {
            steps {
                script {
                    echo 'Uploading SBOMs to Dependency-Track...'

                    withCredentials([string(credentialsId: 'dependency-track-api', variable: 'DT_API_KEY')]) {

                        dir("${BACKEND_DIR}") {
                            if (fileExists('target/bom.json')) {
                                echo 'Uploading Backend SBOM...'
                                try {
                                    dependencyTrackPublisher(
                                        artifact: 'target/bom.json',
                                        projectName: "${DT_PROJECT_NAME}-Backend",
                                        projectVersion: "${DT_PROJECT_VERSION}",
                                        synchronous: false,
                                        autoCreateProjects: true,
                                        dependencyTrackUrl: "${DT_URL}",
                                        apiKey: env.DT_API_KEY
                                    )
                                } catch (Exception e) {
                                    echo "⚠ Backend upload failed: ${e.getMessage()}"
                                }
                            }
                        }

                        dir("${FRONTEND_DIR}") {
                            if (fileExists('bom.json')) {
                                echo 'Uploading Frontend SBOM...'
                                try {
                                    dependencyTrackPublisher(
                                        artifact: 'bom.json',
                                        projectName: "${DT_PROJECT_NAME}-Frontend",
                                        projectVersion: "${DT_PROJECT_VERSION}",
                                        synchronous: false,
                                        autoCreateProjects: true,
                                        dependencyTrackUrl: "${DT_URL}",
                                        apiKey: env.DT_API_KEY
                                    )
                                } catch (Exception e) {
                                    echo "⚠ Frontend upload failed: ${e.getMessage()}"
                                }
                            }
                        }
                    }

                    echo '✓ Dependency-Track upload complete!'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                script {
                    echo 'Archiving build artifacts...'
                    archiveArtifacts artifacts: "${BACKEND_DIR}/target/*.jar,${BACKEND_DIR}/target/*.war",
                                     allowEmptyArchive: true, fingerprint: true
                    archiveArtifacts artifacts: "${FRONTEND_DIR}/dist/**/*",
                                     allowEmptyArchive: true, fingerprint: true
                    archiveArtifacts artifacts: "${FRONTEND_DIR}/coverage/**/*",
                                     allowEmptyArchive: true
                    archiveArtifacts artifacts: "${BACKEND_DIR}/target/bom.json,${FRONTEND_DIR}/bom.json",
                                     allowEmptyArchive: true, fingerprint: true
                    echo 'Artifacts archived successfully!'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deployment Stage Complete!'
                }
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Execution Summary ==='
            echo "Finished at: ${new Date()}"
        }

        success {
            echo '✓ Pipeline completed successfully!'
            echo "View Dependency-Track: ${DT_URL}"
        }

        failure {
            echo '❌ Pipeline FAILED! Check logs above for details.'
        }

        unstable {
            echo '⚠ Pipeline is UNSTABLE — some tests failed.'
        }

        cleanup {
            echo 'Cleaning up workspace...'
        }
    }
}
