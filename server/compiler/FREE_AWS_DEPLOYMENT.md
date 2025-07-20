# Free AWS Deployment for Cavélix Compiler Service

This guide provides step-by-step instructions for deploying the compiler service to AWS completely within the free tier.

## Overview

We'll use:
- AWS EC2 t2.micro instance (free tier eligible for 12 months)
- Docker to run the compiler service
- No ECR (to avoid storage costs)

## Step 1: Set Up AWS EC2 Instance

1. **Create an AWS account** if you don't have one
   - Sign up at [aws.amazon.com](https://aws.amazon.com)
   - You'll need a credit card for verification, but we'll stay within free tier limits

2. **Launch a free tier EC2 instance**
   ```bash
   # Login to AWS Console
   # Navigate to EC2 Dashboard
   # Click "Launch Instance"
   # Select "Amazon Linux 2023 AMI"
   # Choose "t2.micro" instance type (Free tier eligible)
   # Configure instance details (use defaults)
   # Add storage (use default 8GB)
   # Add tags (optional)
   # Configure security group:
      # Allow SSH (port 22) from your IP
      # Allow HTTP (port 80) from anywhere
      # Allow Custom TCP (port 8080) from anywhere
   # Review and launch
   # Create or select a key pair and download it
   ```

3. **Connect to your instance**
   ```bash
   # Change permissions on your key file
   chmod 400 your-key-pair.pem
   
   # Connect via SSH
   ssh -i your-key-pair.pem ec2-user@your-instance-public-dns
   ```

## Step 2: Install Docker on EC2

```bash
# Update packages
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker service
sudo service docker start

# Add ec2-user to docker group
sudo usermod -a -G docker ec2-user

# Enable Docker to start on boot
sudo systemctl enable docker

# Log out and log back in for group changes to take effect
exit
# (reconnect with SSH)
```

## Step 3: Set Up the Compiler Service

1. **Create project directory**
   ```bash
   mkdir -p ~/cavelix-compiler/temp ~/cavelix-compiler/outputs
   cd ~/cavelix-compiler
   ```

2. **Create Dockerfile**
   ```bash
   cat > Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

# Install necessary compilers and dependencies
RUN apk add --no-cache \
    build-base \
    gcc \
    g++ \
    python3 \
    py3-pip \
    openjdk11 \
    maven

# Create directories for temporary files and outputs
RUN mkdir -p /app/temp /app/outputs && chmod 777 /app/temp /app/outputs

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port
EXPOSE 8080

# Start the compiler service
CMD ["node", "compilerService.js"]
EOL
   ```

3. **Create package.json**
   ```bash
   cat > package.json << 'EOL'
{
  "name": "cavelix-compiler",
  "version": "1.0.0",
  "description": "Code compiler service for Cavélix",
  "main": "compilerService.js",
  "scripts": {
    "start": "node compilerService.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "uuid": "^9.0.0"
  }
}
EOL
   ```

4. **Create compilerService.js**
   ```bash
   cat > compilerService.js << 'EOL'
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || 'https://cavelix.vercel.app',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Create temp and output directories
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'compiler' });
});

// Compile and run code
app.post('/api/run', async (req, res) => {
  try {
    const { language, code, input } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required' });
    }
    
    const id = uuidv4();
    const result = await compileAndRun(language, code, input, id);
    res.json(result);
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: 'Failed to run code', details: error.message });
  }
});

// Function to compile and run code
async function compileAndRun(language, code, input, id) {
  const codeFilePath = path.join(tempDir, `${id}.${getFileExtension(language)}`);
  const inputFilePath = path.join(tempDir, `${id}.in`);
  const outputFilePath = path.join(outputDir, `${id}.out`);
  
  // Write code and input to files
  fs.writeFileSync(codeFilePath, code);
  if (input) {
    fs.writeFileSync(inputFilePath, input);
  }
  
  let compileCommand = '';
  let runCommand = '';
  
  switch (language) {
    case 'cpp':
      compileCommand = `g++ ${codeFilePath} -o ${path.join(tempDir, id)}`;
      runCommand = input 
        ? `${path.join(tempDir, id)} < ${inputFilePath} > ${outputFilePath} 2>&1`
        : `${path.join(tempDir, id)} > ${outputFilePath} 2>&1`;
      break;
    case 'java':
      // Extract class name from code
      const className = extractJavaClassName(code) || 'Main';
      const classFilePath = path.join(tempDir, `${className}.java`);
      
      // Rename file to match class name
      fs.writeFileSync(classFilePath, code);
      
      compileCommand = `javac ${classFilePath}`;
      runCommand = input 
        ? `cd ${tempDir} && java ${className} < ${inputFilePath} > ${outputFilePath} 2>&1`
        : `cd ${tempDir} && java ${className} > ${outputFilePath} 2>&1`;
      break;
    case 'python':
      compileCommand = ''; // No compilation needed
      runCommand = input 
        ? `python3 ${codeFilePath} < ${inputFilePath} > ${outputFilePath} 2>&1`
        : `python3 ${codeFilePath} > ${outputFilePath} 2>&1`;
      break;
    default:
      throw new Error('Unsupported language');
  }
  
  try {
    // Compile if needed
    if (compileCommand) {
      await executeCommand(compileCommand);
    }
    
    // Set timeout for execution (5 seconds)
    const startTime = Date.now();
    await executeCommand(runCommand, 5000);
    const endTime = Date.now();
    
    // Read output
    const output = fs.existsSync(outputFilePath) 
      ? fs.readFileSync(outputFilePath, 'utf8')
      : '';
    
    // Clean up files
    cleanupFiles(id, language);
    
    return {
      status: 'success',
      output,
      executionTime: endTime - startTime,
      memoryUsed: 0 // Memory tracking not implemented
    };
  } catch (error) {
    // Clean up files
    cleanupFiles(id, language);
    
    if (error.message.includes('timeout')) {
      return {
        status: 'error',
        output: 'Execution timed out (5 seconds limit)',
        error: 'Time Limit Exceeded'
      };
    }
    
    return {
      status: 'error',
      output: error.message,
      error: 'Runtime Error'
    };
  }
}

// Helper function to execute shell commands
function executeCommand(command, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const process = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// Helper function to get file extension based on language
function getFileExtension(language) {
  switch (language) {
    case 'cpp': return 'cpp';
    case 'java': return 'java';
    case 'python': return 'py';
    default: return 'txt';
  }
}

// Helper function to extract Java class name
function extractJavaClassName(code) {
  const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  return classMatch ? classMatch[1] : null;
}

// Helper function to clean up temporary files
function cleanupFiles(id, language) {
  try {
    const codeFilePath = path.join(tempDir, `${id}.${getFileExtension(language)}`);
    const inputFilePath = path.join(tempDir, `${id}.in`);
    const outputFilePath = path.join(outputDir, `${id}.out`);
    const executablePath = path.join(tempDir, id);
    
    // Remove files if they exist
    if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    if (fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
    
    // For Java, also clean up class files
    if (language === 'java') {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        if (file.endsWith('.class') && file.startsWith(id)) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Compiler service running on port ${PORT}`);
});
EOL
   ```

## Step 4: Build and Run the Docker Container

```bash
# Build the Docker image
docker build -t cavelix-compiler .

# Run the container
docker run -d --name cavelix-compiler -p 8080:8080 \
  -e CLIENT_URL=https://cavelix.vercel.app \
  -v ~/cavelix-compiler/temp:/app/temp \
  -v ~/cavelix-compiler/outputs:/app/outputs \
  --restart unless-stopped \
  cavelix-compiler
```

## Step 5: Set Up Automatic Restart

```bash
# Create a startup script
cat > ~/start-compiler.sh << 'EOL'
#!/bin/bash
# Check if container exists
if [ ! "$(docker ps -q -f name=cavelix-compiler)" ]; then
  if [ "$(docker ps -aq -f status=exited -f name=cavelix-compiler)" ]; then
    # Cleanup
    docker rm cavelix-compiler
  fi
  # Run container
  docker run -d --name cavelix-compiler -p 8080:8080 \
    -e CLIENT_URL=https://cavelix.vercel.app \
    -v ~/cavelix-compiler/temp:/app/temp \
    -v ~/cavelix-compiler/outputs:/app/outputs \
    --restart unless-stopped \
    cavelix-compiler
fi
EOL

# Make it executable
chmod +x ~/start-compiler.sh

# Add to crontab to run at reboot
(crontab -l 2>/dev/null; echo "@reboot ~/start-compiler.sh") | crontab -
```

## Step 6: Update Client Configuration

Update your client's environment variables to point to your EC2 instance:

```
VITE_COMPILER_URL=http://your-ec2-public-dns:8080/api
```

## Step 7: Test the Deployment

1. Make sure the compiler service is running:
   ```bash
   docker ps
   ```

2. Test the API endpoint:
   ```bash
   curl -X POST http://localhost:8080/api/run \
     -H "Content-Type: application/json" \
     -d '{"language":"python","code":"print(\"Hello, Cavélix!\")","input":""}'
   ```

## Important Notes for Free Tier

1. **Stay within free tier limits**:
   - EC2: 750 hours per month of t2.micro (enough for one instance running 24/7)
   - Data transfer: 15GB out per month
   - EBS storage: 30GB

2. **Set up billing alerts**:
   - Go to AWS Billing Dashboard
   - Create a billing alarm to notify you if charges exceed $0

3. **Clean up when not using**:
   - Stop your instance when not in use to conserve free tier hours
   - To stop: `aws ec2 stop-instances --instance-ids your-instance-id`
   - To start: `aws ec2 start-instances --instance-ids your-instance-id`

4. **Monitor usage**:
   - Regularly check the AWS Billing Dashboard
   - Look for any unexpected charges

By following this guide, your compiler service should run completely within AWS's free tier limits.
