# 🧠 Community AI Chatbot – Frontend

This is the React 19+ Vite-based frontend for the **Community AI Chatbot**, a full-stack agentic RAG app that semantically searches community posts and interacts with users using contextual memory and follow-up suggestions.

---

## 🚀 Features

- Modern React 19 with Vite setup
- React Bootstrap UI components
- Apollo Client integration with GraphQL backend
- Markdown support via `react-markdown`
- Context-aware conversation history
- AI-suggested follow-up questions
- Scroll-to-bottom auto behavior
- Responsive layout (desktop-first)

---

## 📸 UI Preview

![Chatbot UI Preview](../screenshots/sample-ui.png)

---

## 🧱 Project Structure

```
community-engagement-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── Chatbot.jsx
│   ├── main.jsx
│   ├── index.css
│   └── ...
├── .gitignore
├── README.md
├── vite.config.js
└── package.json
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Runs at: [http://localhost:5173](http://localhost:5173)

> Ensure the backend is also running at `http://localhost:5000/graphql`

---

## 📡 GraphQL Endpoint

The frontend sends queries to the backend using Apollo Client:
```js
const client = new ApolloClient({
  uri: "http://localhost:5000/graphql",
  cache: new InMemoryCache(),
});
```

Update the `uri` if deploying to a remote server.

---
