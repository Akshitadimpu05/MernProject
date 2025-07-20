# Cavélix Deployment Guide

This guide provides step-by-step instructions for deploying the Cavélix across three different platforms:
- Client (Frontend) → Vercel
- Server (Backend) → Render
- Compiler Service → AWS Elastic Beanstalk

## 1. Client Deployment to Vercel

### Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your code

### Steps

1. **Prepare your client code**
   - The `vercel.json` file has been created in the client directory
   - The `.env.production` file has been set up with the correct API URLs

2. **Deploy to Vercel**
   - Install Vercel CLI: `npm install -g vercel`
   - Navigate to the client directory: `cd /home/akshita/Projects/Cavélix/client`
   - Login to Vercel: `vercel login`
   - Deploy: `vercel --prod`
   - Follow the prompts to complete the deployment

3. **Configure Environment Variables on Vercel Dashboard**
   - Go to your project on the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add the following variables:
     - `VITE_API_URL`: https://cavelix-server.onrender.com/api
     - `VITE_COMPILER_URL`: https://[your-aws-eb-url].elasticbeanstalk.com/api
     - `VITE_RAZORPAY_KEY_ID`: your_razorpay_key_id

## 2. Server Deployment to Render

### Prerequisites
- A Render account (sign up at [render.com](https://render.com))
- Git repository with your code

### Steps

1. **Prepare your server code**
   - The `render.yaml` file has been created in the server directory
   - The health check endpoint has been added

2. **Deploy to Render**
   - Login to Render dashboard
   - Click "New" and select "Blueprint"
   - Connect your Git repository
   - Select the repository and branch
   - Render will detect the `render.yaml` file and set up the service
   - Click "Apply" to start the deployment

3. **Configure Environment Variables on Render Dashboard**
   - Once the service is created, go to the Environment tab
   - Add the following variables:
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `MONGODB_URI`: your_mongodb_connection_string
     - `JWT_SECRET`: your_jwt_secret
     - `RAZORPAY_KEY_ID`: your_razorpay_key_id
     - `RAZORPAY_KEY_SECRET`: your_razorpay_key_secret
     - `CLIENT_URL`: https://cavelix.vercel.app

## 3. Compiler Service Deployment to AWS Elastic Beanstalk

### Prerequisites
- An AWS account
- AWS CLI installed and configured
- EB CLI installed (`pip install awsebcli`)

### Steps

1. **Prepare your compiler service code**
   - The compiler service files have been created in the server/compiler directory
   - The AWS configuration files are in the server/compiler/aws-config directory

2. **Create an ECR repository for the Docker image**
   ```bash
   aws ecr create-repository --repository-name cavelix-compiler
   ```

3. **Build and push the Docker image**
   ```bash
   cd /home/akshita/Projects/Cavélix/server/compiler
   
   # Get the ECR login command
   aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-aws-account-id.dkr.ecr.your-region.amazonaws.com
   
   # Build the Docker image
   docker build -t cavelix-compiler .
   
   # Tag the image
   docker tag cavelix-compiler:latest your-aws-account-id.dkr.ecr.your-region.amazonaws.com/cavelix-compiler:latest
   
   # Push the image
   docker push your-aws-account-id.dkr.ecr.your-region.amazonaws.com/cavelix-compiler:latest
   ```

4. **Initialize Elastic Beanstalk application**
   ```bash
   cd /home/akshita/Projects/Cavélix/server/compiler
   
   # Copy AWS config files to the root directory
   cp -r aws-config/.ebextensions .
   cp aws-config/Dockerrun.aws.json .
   
   # Initialize EB application
   eb init cavelix-compiler --platform docker --region your-region
   
   # Create the environment
   eb create cavelix-compiler-env --single --instance-type t2.micro
   ```

5. **Update the Dockerrun.aws.json file with your ECR repository URL**
   - Edit the Dockerrun.aws.json file to update the Image.Name with your ECR repository URL
   - Deploy the updated configuration: `eb deploy`

6. **Configure Security Group**
   - Go to the AWS EC2 Console
   - Find the security group named "cavelix-compiler-sg"
   - Add an inbound rule to allow traffic on port 8080 from your client application

## Connecting the Components

After all three components are deployed, update the environment variables to ensure they can communicate with each other:

1. **Update Vercel environment variables**
   - `VITE_API_URL`: https://cavelix-server.onrender.com/api
   - `VITE_COMPILER_URL`: https://[your-aws-eb-url].elasticbeanstalk.com/api

2. **Update Render environment variables**
   - `CLIENT_URL`: https://cavelix.vercel.app
   - `COMPILER_URL`: https://[your-aws-eb-url].elasticbeanstalk.com/api

3. **Update AWS EB environment variables**
   - `CLIENT_URL`: https://cavelix.vercel.app

## Testing the Deployment

1. Visit your client application at https://cavelix.vercel.app
2. Test user registration and login
3. Try solving a problem and submitting code
4. Check that the compiler service correctly executes the code
5. Verify that user stats and submissions are displayed correctly on the profile page

## Troubleshooting

### Client Issues
- Check browser console for errors
- Verify that environment variables are set correctly
- Ensure the API endpoints are correctly configured in the client code

### Server Issues
- Check Render logs for errors
- Verify MongoDB connection
- Test API endpoints using a tool like Postman

### Compiler Service Issues
- Check AWS EB logs
- Verify that the Docker container is running
- Test the compiler service API directly using Postman

## Monitoring and Maintenance

- Set up monitoring for all three components
- Regularly check logs for errors
- Set up alerts for downtime or high resource usage
- Implement a CI/CD pipeline for automated deployments
