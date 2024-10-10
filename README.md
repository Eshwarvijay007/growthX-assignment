##NOTE:
.env file is not added to gitignore for ease of the demonstration process
it contains the mongouri

## Technologies Used

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Axios
- **Database**: MongoDB

## Installation

To get started with the project, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Eshwarvijay007/growthX-assignment.git
   cd growthX-assignment
   ```

2. **Set up the backend:**

   - Navigate to the backend directory:

     ```bash
     cd backend
     ```

   - Install the required dependencies:

     ```bash
     npm install nodemon bcrypt express cors
     ```

   - Create a `.env` file in the backend directory to store your MongoDB connection string (if needed):

     ```
     MONGODB_URI=your mongo uri
     ```

   - Start the backend server:

     ```bash
     node server.js
     ```
The backend will be available at `http://localhost:5000`.
3. **Set up the frontend:**

   - Navigate to the frontend directory:

     ```bash
     cd ../frontend
     ```

   - Install the required dependencies:

     ```bash
     npm install
     ```

   - Start the frontend development server:

     ```bash
     npm start
     ```

   The frontend will be available at `http://localhost:5000`.

   navigate to the root directory and paste this: `npm install concurrently --save-dev`.
   package.json add this script: 
  `"scripts": {
  "start": "concurrently \"npm run server\" \"npm run client\"",
  "server": "nodemon backend/server.js --watch backend",
  "client": "npm start --prefix frontend"`
}



## Usage

1. In the root directory start server by: npm start
2. Register as a user or admin.
3. Log in to the application.
4. Users can upload assignments, and admins can manage them.

## API Endpoints

### User Endpoints

- **POST /api/users/register**: Register a new user.
- **POST /api/users/login**: User login.
- **POST /api/users/upload**: Upload an assignment.
- **GET /api/users/admins**: Fetch all admins.

### Admin Endpoints

- **POST /api/admin/register**: Register a new admin.
- **POST /api/admin/login**: Admin login.
- **GET /api/admin/assignments**: View assignments tagged to the admin.
- **POST /api/admin/assignments/:id/accept**: Accept an assignment.
- **POST /api/admin/assignments/:id/reject**: Reject an assignment.
