# Manual Render Deployment Guide for Cavélix Server

Since the Blueprint deployment is having issues finding your package.json file, let's deploy manually:

## Steps for Manual Deployment

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com/)
   - Sign in with your account

2. **Create a New Web Service**
   - Click on "New" in the top right
   - Select "Web Service" (not Blueprint)

3. **Connect Your Repository**
   - Connect to your GitHub repository
   - Select the repository containing your Cavélix project

4. **Configure the Web Service**
   - **Name**: cavelix-server
   - **Environment**: Node
   - **Region**: Choose the one closest to your users
   - **Branch**: main (or whichever branch has your latest code)
   - **Root Directory**: server
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Plan**: Free

5. **Set Environment Variables**
   - Scroll down to the "Environment Variables" section
   - Add the following key-value pairs:
     ```
     NODE_ENV=production
     PORT=10000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     CLIENT_URL=https://cavelix.vercel.app
     COMPILER_URL=http://your-ec2-public-dns:8080/api
     ```

6. **Health Check Path**
   - Set the health check path to: `/api/health`

7. **Create Web Service**
   - Click "Create Web Service" at the bottom of the page

8. **Monitor Deployment**
   - Render will start building and deploying your service
   - You can monitor the logs to ensure everything is working correctly

## After Deployment

1. **Get Your Service URL**
   - Once deployed, Render will provide a URL for your service (e.g., https://cavelix-server.onrender.com)
   - This is the URL you'll use for your backend API

2. **Update Client Configuration**
   - Update your client's `.env.production` file to point to this URL:
     ```
     VITE_API_URL=https://cavelix-server.onrender.com/api
     ```

3. **Test the API**
   - Visit `https://cavelix-server.onrender.com/api/health` to verify the server is running

## Troubleshooting

If you encounter any issues:
1. Check the deployment logs in the Render dashboard
2. Verify your environment variables are set correctly
3. Make sure your server code has the necessary health check endpoint
4. Ensure your MongoDB connection string is correct and accessible from Render
