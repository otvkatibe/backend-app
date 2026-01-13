# Backend App - Personal Finance Manager

Welcome to the **Personal Finance Manager**! This robust backend application is designed to help you take control of your financial life. Built with a modern, type-safe stack, it provides all the tools necessary to track expenses, manage budgets, set ambitious financial goals, and even automate those pesky recurring payments.

We've focused on creating a secure, scalable, and maintainable RESTful API that can serve as the solid foundation for any frontend interface, whether it's a mobile app or a web dashboard.

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
- [Architecture & Design](#-architecture--design)
- [Development Workflow](#-development-workflow)

---

## � About the Project

Managing money shouldn't be a chore. This project simplifies financial tracking by offering a complete suite of features:

- **Smart Transaction Tracking**: Record every income and expense with detail. We support multiple **wallets** (like Cash, Bank Accounts, or Savings) so you can keep funds separate but view your total net worth in your preferred currency (defaulting to BRL).
- **Automated Recurring Transactions**: Stop manually entering your Netflix subscription or rent every month. With our powerful CRON-based scheduler, you can set up transactions once—monthly, weekly, or on custom schedules—and the system handles the rest automatically.
- **Budgets & Goals**: Keep your spending in check by setting monthly **Budgets** for specific categories (like "Dining Out" or "Transport"). Planning for a dream vacation? Create **Goals** with deadlines and track your progress as you save.
- **Secure & Private**: Your data is protected with industry-standard BCrypt password encryption and JWT (JSON Web Token) authentication, ensuring only you have access to your financial details.

### The Tech Stack

Use the power of **TypeScript** and **Node.js** for a reliable runtime. We rely on **Express** for handling requests efficiently, while **Prisma** serves as our modern ORM, making database interactions with **PostgreSQL** type-safe and intuitive. To ensure performance, we use **Redis** for caching and managing distributed tasks, ensuring the app stays fast even under load.

---

## 🏗 Architecture & Design

We believe in clean code that is easy to maintain and scale. This project follows a strict **Layered Architecture**, separating concerns into distinct logical components:

1. **Controllers**: The entry point for all requests. They handle the "what" — validating your input and deciding which service to call.
2. **Services**: The heart of the application. This is where the business logic lives. Whether it's calculating a new wallet balance or processing a recurring payment, the Service layer handles the "how".
3. **Repositories & Prisma**: Use Prisma to interact deeply with our PostgreSQL database, ensuring data integrity without successful SQL injection risks.

We also employ **Middlewares** to handle cross-cutting concerns like security. Before a request reaches a controller, it passes through our authentication gates and validation checks (powered by **Zod**), so bad data never even touches our core logic.

---

## � Getting Started

Ready to run the project? We've made it easy using Docker.

### Prerequisites

You'll need **Node.js** (v18+) and **Docker** installed on your machine. Docker allows us to spin up the database and Redis without you needing to install them manually.

### Installation

1. **Clone the code**:

    ```bash
    git clone <repository-url>
    cd backend-app
    ```

2. **Install dependencies**:
    Grab all the necessary libraries.

    ```bash
    npm install
    ```

3. **Wake up the infrastructure**:
    Use Docker Compose to start PostgreSQL and Redis in the background.

    ```bash
    docker-compose up -d
    ```

4. **Set up your environment**:
    Create a `.env` file in the root folder. You'll need to define your `DATABASE_URL`, `REDIS_URL`, and a secure `JWT_SECRET`. Check the `prisma/schema.prisma` or the example config for guidance.

5. **Initialize the Database**:
    Apply our schema to your new local database.

    ```bash
    npx prisma migrate dev
    ```

6. **Run the App**:
    Start the development server.

    ```bash
    npm run dev
    ```

    Your API is now live at `http://localhost:3000`!

---

## � Development Workflow

We use a structured **Gitflow** process to keep our codebase clean and stable.

- **Main Branch**: This is our production-ready state. If it's on `main`, it's stable.
- **Develop Branch**: The integration hub. All new features land here first for testing.
- **Feature Branches**: Working on something new? Create a branch like `feature/my-new-feature` from `develop`. Once you're done, open a Pull Request to merge it back.

This ensures that we can experiment and build rapidly without breaking the core application.

---

## 🧪 Testing

Quality is key. We use **Jest** to run a comprehensive suite of tests. You can run `npm test` to verify everything from simple unit logic to full end-to-end user flows (like creating a recurring transaction and ensuring it processes correctly).
