<p align="center">
  <h1 align="center">🧾 KriParth POS</h1>
  <p align="center">
    <strong>AI-Powered Point of Sale System for Modern Retail</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</p>

---

## 📌 Why KriParth POS?

Most POS systems available today are either **too expensive** for small businesses, **too complex** to set up, or **completely offline** with no intelligent insights. Store owners are left manually tracking sales, guessing restock timings, and making decisions based on gut feeling rather than data.

**KriParth POS** was built to solve exactly this — a **lightweight, affordable, and AI-powered** POS system that doesn't just process transactions but actually _helps you grow your business_.

### 🤔 The Problem We're Solving

| Pain Point | How KriParth POS Fixes It |
|---|---|
| Expensive POS licenses & hardware | **Free & open-source**, runs on any browser |
| No actionable insights from sales data | **GROK AI integration** generates smart reports & suggestions |
| Complex setup & steep learning curve | **Clean, intuitive UI** — ready in minutes |
| Inventory management is manual & error-prone | **Real-time inventory tracking** with low-stock alerts |
| No support for small/medium businesses | **Designed specifically** for local shops, cafés, and retail stores |

---

## 🚀 What Makes Us Different

Unlike traditional POS systems, KriParth POS ships with an **AI brain** powered by **GROK AI**:

- 🧠 **AI-Powered Business Insights** — Get sales trend analysis, demand forecasting, and actionable suggestions like _"Stock more cold drinks — sales spike every Friday evening."_
- 📊 **Intelligent Reporting** — Auto-generated daily/weekly/monthly reports that highlight what matters, not just raw numbers.
- 💬 **Natural Language Queries** — Ask your POS questions like _"What was my best-selling item last week?"_ and get instant answers.
- 🔔 **Smart Alerts** — Proactive notifications for low inventory, unusual sales patterns, and revenue milestones.
- 🌐 **Fully Web-Based** — No specialized hardware needed. Works on tablets, laptops, and desktops.
- 🆓 **Open Source & Free** — No recurring license fees. Own your data, own your system.

---

## ✨ Features

### 🛒 Core POS
- Fast billing with quick item search & entry
- Multiple payment mode support (Cash, UPI, Card)
- Receipt generation (print & digital)
- Customer management & purchase history
- Discount & coupon management

### 📦 Inventory Management
- Real-time stock tracking
- Low-stock alerts & auto-reorder suggestions
- Category and supplier management
- Batch & expiry tracking

### 📈 Analytics & Reports
- Daily, weekly, and monthly sales reports
- Revenue & profit dashboards
- Top-selling products & slow movers
- Employee performance tracking

### 🤖 AI Integration (GROK AI)
- Sales trend analysis & demand forecasting
- Natural language business queries
- Smart restocking recommendations
- Customer behavior insights
- Anomaly detection (unusual refunds, voids)

### 👥 User Management
- Role-based access control (Admin, Manager, Cashier)
- Activity logs & audit trails
- Multi-store support

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React JS | Dynamic, component-based UI |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | MongoDB | Flexible NoSQL data storage |
| **ODM** | Mongoose | Schema-based data modeling |
| **AI Engine** | GROK AI | Intelligent insights & NLP queries |
| **Authentication** | JWT + bcrypt | Secure session management |
| **State Management** | Redux / Context API | Predictable frontend state |

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  (Components, Redux Store, API Service Layer)        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│              Express.js API Server                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐     │
│  │  Routes  │  │  Auth    │  │  Middleware     │     │
│  │  Layer   │  │  (JWT)   │  │  (Validation)  │     │
│  └────┬─────┘  └──────────┘  └────────────────┘     │
│       │                                              │
│  ┌────▼─────────────────────────────────────────┐    │
│  │           Business Logic / Services           │    │
│  └────┬──────────────────────────┬──────────────┘    │
│       │                          │                    │
│  ┌────▼──────────┐    ┌─────────▼────────────┐       │
│  │  Mongoose     │    │   GROK AI Service    │       │
│  │  Models/DB    │    │   (Insights & NLP)   │       │
│  └────┬──────────┘    └──────────────────────┘       │
└───────┼──────────────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────┐
│                    MongoDB Atlas                      │
│  (Products, Sales, Users, Inventory, Reports)         │
└──────────────────────────────────────────────────────┘
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **GROK AI API Key**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/KriParth-POS.git
cd KriParth-POS

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kriparth-pos
JWT_SECRET=your_jwt_secret_key
GROK_AI_API_KEY=your_grok_api_key
NODE_ENV=development
```

### Running the Application

```bash
# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd client
npm start
```

The app will be available at `http://localhost:5173`

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow ESLint configuration for code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation for API changes

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **KriParth Team** — _Initial work & development_

---

<p align="center">
  Built with ❤️ for small businesses everywhere
</p>
