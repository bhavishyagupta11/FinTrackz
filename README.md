# 💰 FinTrackz – Finance Expense Tracker

A modern, intelligent, and user-centric **Finance Expense Tracker** designed to help users track, analyze, and optimize their spending habits with a clean UI and powerful frontend logic.

---

## 🚀 Overview

FinTrackz is a **frontend-focused web application** that runs locally and provides:

* Real-time expense tracking
* Smart subscription detection (logic-based)
* Budget monitoring
* Interactive graphs and insights
* Smooth UI with hover & toggle interactions

> ⚠️ **Note:** This project does **NOT use any backend or external APIs**.
> All data handling and logic are implemented **locally in the frontend**.

---

## 🌐 Local Development

The project runs on:

```
http://localhost:5173
```

This indicates the use of **Vite** as the development server.

---

## ✨ Features

### 📊 Expense Tracking

* Add, delete, and manage transactions
* Categorization (Food, Shopping, Bills, etc.)
* Timestamp-based tracking

---

### 🔄 Smart Subscription Detection (Core Logic Feature)

The system automatically detects subscriptions based on:

* Same transaction amount
* Same category / merchant
* Regular monthly intervals

#### Two Ways Subscriptions Are Managed:

1. **Auto-detected** using transaction patterns
2. **Admin-added** (manually configured)

---

### 👨‍💼 Admin Role (View-Only Mode)

* Admin has **read-only access**
* Can:

  * View all transactions
  * Monitor detected subscriptions
  * Analyze spending trends
* Cannot modify user data (ensures data safety)

---

### 💸 Budget Management

* Users can define budgets
* Tracks spending vs budget
* Provides visual warnings when limits are approached/exceeded

---

### 📈 Graphs & Insights

* Category-wise expense distribution
* Monthly spending trends
* Budget vs actual comparison

---

### 🎯 Interactive UI/UX

#### 🔁 Toggle Functionality

* Switch between:

  * Dashboard views
  * Time ranges (monthly/weekly)
  * Different data visualizations
* No page reloads → smooth SPA-like experience

#### 🖱️ Hover Effects

* Highlight UI components dynamically
* Show additional data on hover
* Improve user interaction feedback

---

### 🎨 Minimal & Clean UI

* Simple layout focused on usability
* Human-like design (not template-heavy)
* Smooth transitions and spacing

---

### 🏷️ Branding

* Custom **FinTrackz logo**
* Consistent design language across UI

---

## 🛠️ Technologies Used

### 💻 Frontend

* **HTML5**
* **CSS3** (animations, hover effects, responsive design)
* **JavaScript (ES6+)**

### ⚡ Dev Environment

* **Vite** (fast dev server → localhost:5173)

### 📊 Visualization

* Chart.js / custom graph logic (depending on implementation)

---

## 🧠 Core Logic Explanation

### 📌 Subscription Detection Algorithm

The system scans transaction history and:

1. Groups transactions by:

   * Merchant / category
   * Amount

2. Checks time gaps between transactions

3. If:

   * Interval ≈ 30 days
   * Pattern repeats ≥ 2–3 times

➡️ It flags as a **subscription**

---

### 📌 Budget Tracking Logic

```
If (Current Spending >= 80% of Budget)
    → Show Warning

If (Current Spending > Budget)
    → Show Alert
```

---

### 📌 UI Interaction Logic

* Toggle states managed via JS event listeners
* Hover effects handled via CSS transitions + JS enhancements
* Dynamic DOM updates for real-time UI changes

---

## 📂 Complete Project Structure

```
FinTrackz/
│
├── index.html                # Main entry point
├── package.json             # Project dependencies & scripts (Vite)
├── vite.config.js           # Vite configuration
│
├── public/
│   └── logo.png             # Application logo / assets
│
├── src/
│   │
│   ├── main.js              # Entry JS (Vite bootstrap)
│   ├── app.js               # Core application logic
│   │
│   ├── styles/
│   │   ├── global.css       # Base styles
│   │   ├── dashboard.css    # Dashboard styling
│   │   └── animations.css   # Hover & transition effects
│   │
│   ├── components/
│   │   ├── navbar.js        # Navigation bar
│   │   ├── sidebar.js       # Sidebar controls
│   │   ├── transaction.js   # Transaction UI logic
│   │   ├── budget.js        # Budget handling UI
│   │   ├── charts.js        # Graph rendering logic
│   │   └── toggle.js        # Toggle interaction logic
│   │
│   ├── utils/
│   │   ├── subscriptionDetector.js   # Subscription detection logic
│   │   ├── budgetCalculator.js      # Budget logic
│   │   └── formatter.js             # Utility helpers
│   │
│   ├── data/
│   │   └── mockData.js      # Local transaction data (no API)
│   │
│   └── assets/
│       └── logo.svg         # Branding assets
│
└── README.md                # Documentation
```

---

## ⚙️ Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/FinTrackz.git
```

2. Navigate to project folder:

```bash
cd FinTrackz
```

3. Install dependencies:

```bash
npm install
```

4. Run development server:

```bash
npm run dev
```

5. Open in browser:

```
http://localhost:5173
```

---

## 🧪 Testing

* UI tested for:

  * Responsiveness
  * Hover & toggle interactions
* Logic tested for:

  * Subscription detection accuracy
  * Budget threshold triggers

---

## 🚧 Limitations

* No backend → data is not persisted permanently
* No authentication system
* Works locally only

---

## 🔮 Future Enhancements

* Backend integration (Node.js / Firebase)
* User authentication system
* Persistent database storage
* AI-based expense prediction
* Mobile-friendly version

---

## 🤝 Contribution

* Fork the repository
* Create a feature branch
* Submit a pull request

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Bhavishya Gupta**
B.Tech CSE (AI + ML)
Focused on building intelligent systems & solving real-world problems.

---

## 🌟 Final Note

FinTrackz is designed to simulate a **real-world finance tracking system** purely using frontend logic, showcasing strong understanding of:

* System design thinking
* UI/UX engineering
* Pattern-based data analysis

---
