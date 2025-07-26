# Cavélix - Algorithm Learning Platform

Cavélix is a comprehensive algorithm learning platform that helps users master data structures and algorithms through interactive problem-solving, visualization, and practice.

## Features

- **User Authentication**: Secure login and registration system
- **Problem Repository**: Curated collection of algorithm problems with varying difficulty levels
- **Code Editor**: In-browser code editor with syntax highlighting
- **Code Execution**: Run and test your code directly in the browser
- **Submissions History**: Track your progress and review past submissions
- **User Profiles**: Personalized profiles with statistics and achievements
- **Premium Subscription**: Access advanced features with PayPal payment integration
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- Material-UI components
- CodeMirror for code editing
- PayPal React SDK for payment processing

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- PayPal API for payment processing
- Custom code execution engine

## Environment Setup

### Client Environment Variables
Create a `.env` file in the client directory with the following:
```
VITE_API_URL=http://localhost:5000/api
VITE_COMPILER_URL=http://localhost:8080/api
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

### Server Environment Variables
Create a `.env` file in the server directory with the following:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
CLIENT_URL=http://localhost:5173
```

## Installation and Setup

1. Clone the repository
2. Install dependencies for both client and server:
   ```
   cd client && npm install
   cd ../server && npm install
   ```
3. Start the development servers:
   ```
   # Terminal 1 - Start the backend server
   cd server && npm run dev
   
   # Terminal 2 - Start the frontend client
   cd client && npm run dev
   ```

## Deployment

See the [DEPLOYMENT.md](./DEPLOYMENT.md) file for detailed deployment instructions.

## Premium Subscription

The premium subscription feature uses PayPal for payment processing:

1. Users can subscribe to premium features from the Premium page
2. PayPal integration handles payment processing securely
3. Upon successful payment, user accounts are upgraded to premium status
4. Premium features include advanced problem sets, solutions, and more

## License

MIT
