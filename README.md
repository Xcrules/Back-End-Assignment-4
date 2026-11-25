# Lab 4: Secure Connect and Communication Platform

**Name:** Harsh  
**Roll Number:** 2501060217  
**Course:** Web Dev III  
**Assignment:** Lab 4 (Unit 4)  

---

## 📌 About This Project
This project is a secure, real-time backend application built from scratch using Node.js and Express. It demonstrates core backend security concepts, including user authentication, password hashing, JWT token management, protected API routes, and real-time bidirectional communication using Socket.IO.

## ✨ Key Features
- **Secure Authentication:** User signup and login with `bcrypt` password hashing.
- **JWT Protection:** Stateless session management using JSON Web Tokens.
- **Secure Notes API:** Protected CRUD operations that only allow users to access their own notes.
- **Real-Time Chat:** Live messaging functionality using Socket.IO.
- **Event-Driven Logging:** Uses Node.js `EventEmitter` to log key actions (like new users or new notes) directly to the server console.

---

## 🚀 How to Run the Project

1. **Install Dependencies:**  
   Open your terminal in the project folder and run:
   ```bash
   npm install

2. Set Up Environment Variables:
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/secure_connect
   JWT_SECRET=super_secret_lab_key_2024

3. Start the server
    node server.js

📸 Expected Outputs
Fig 1: Signup and Login
User registration and successful JWT token generation.
<img width="1271" height="1010" alt="Post Screenshot" src="https://github.com/user-attachments/assets/c7b14272-df25-4c18-b560-5a5e563009b2" />

Fig 2: Protected Notes API
API is blocked without a token, but successfully creates a note when a valid JWT is provided.
<img width="1263" height="619" alt="no token provided" src="https://github.com/user-attachments/assets/98cfb785-0742-4906-ac30-ce8a04335284" />

<img width="1274" height="631" alt="Login Screenshot" src="https://github.com/user-attachments/assets/bc4c81c4-b044-4e00-a95a-f5764300505f" />

Fig 3: Real-Time Chat & Event Logging
Live chat functionality and server-side event logging.
<img width="1908" height="844" alt="Chatbox" src="https://github.com/user-attachments/assets/ff808d69-cc43-4e89-aa48-b99486792a3d" />
<img width="1265" height="1017" alt="chatbox (vscode)" src="https://github.com/user-attachments/assets/434ff727-9b57-4461-8bd2-6474688fdc96" />


🛠️ Technologies Used
Node.js & Express.js
MongoDB & Mongoose
JSON Web Token (JWT) & bcrypt
Socket.IO
dotenv & Node.js EventEmitter
