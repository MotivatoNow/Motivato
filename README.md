# Motivato

Motivato is a social network designed for students and companies, combining a freelance portal with social media features. The platform allows students to connect with potential employers, showcase their skills, and collaborate on projects.

## 🚀 Features
- **User Authentication** – Secure login and registration using Firebase.
- **Freelancer Portal** – Students can offer their services and companies can hire them.
- **Social Media Elements** – Users can post updates, like, comment, and interact with others.
- **Real-Time Chat** – Built-in chat functionality powered by Firebase.
- **Professional Profiles** – Students and companies have detailed profile pages.
- **Dashboard & Analytics** – Data visualization using Chart.js and Recharts.
- **Modals for Interactions** – Various modals for editing profiles, posts, missions, and admin dashboard.

## 🛠 Technologies Used
- **Frontend:** React.js, React Router, React Icons, Ant Design, Tailwind CSS, DaisyUI
- **Backend & Database:** Firebase (Authentication, Firestore, Real-Time Database)
- **State Management:** React Hooks
- **Styling:** Tailwind CSS, DaisyUI, Ant Design
- **Utilities:** Moment.js (date/time formatting), React Toastify (notifications)
- **Charts & Graphs:** Chart.js, Recharts
- **Carousel & Animations:** React Slick, Slick Carousel, React Flip Move
- **Modals:** Custom modal components for various interactions

## 📁 Project Structure
```
motivato/
│-- public/             # Static assets
│-- src/
│   │-- components/     # Reusable React components
│   │-- pages/          # Different application pages
│   │-- hooks/          # Custom React hooks for data fetching and actions
│   │-- styles/         # Global styling
│   │-- config/         # Firebase configuration and API setup
│-- package.json        # Dependencies and scripts
│-- tailwind.config.js  # Tailwind CSS configuration
│-- .gitignore          # Git ignore file
```

## ⚙️ Setup & Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/NatanelSmadja/motivato.git
   cd motivato
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Firebase:**
   - Go to `src/config/firebase.js`
   - Replace the placeholder Firebase configuration with your own project details.
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
4. **Start the development server:**
   ```sh
   npm start
   ```

## 🔥 Firebase Database Structure
This project uses Firestore and Firebase Authentication. Below is an example of the Firestore data structure:
```
Firestore Collections:
- users
  - userId (document)
    - firstName
    - lastName
    - email
    - profilePicture
    - bio
    - skills
- posts
  - postId (document)
    - userId
    - content
    - timestamp
    - likes
    - comments
- chats
  - chatId (document)
    - participants
    - messages (subcollection)
      - messageId (document)
        - senderId
        - text
        - timestamp
```

## 📌 Scripts
- **`npm start`** – Runs the app in development mode.
- **`npm build`** – Builds the app for production.
- **`npm test`** – Launches the test runner.

## 📜 License
This project is part of a final year submission and is not licensed for commercial use.

## 📞 Contact
For any inquiries, feel free to reach out!
