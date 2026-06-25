# NextCart E-Commerce

NextCart is an industry-level, full-stack e-commerce platform built with a modern, responsive frontend and a secure, robust backend. It includes a comprehensive shopping experience featuring beautiful product displays, a shopping cart, a secure checkout flow using Razorpay, and a fully functional Admin Dashboard.

## Features

### Frontend (Next.js & Tailwind CSS)
* **Stunning UI/UX**: Premium design aesthetics using glassmorphism, subtle micro-animations, and custom scrollbars.
* **Product Catalog**: Dynamic product grids showcasing the latest electronics, fashion, and furniture.
* **Shopping Cart & Checkout**: Integrated with Razorpay for secure payments.
* **Authentication UI**: Login and registration flows for users.
* **Admin Dashboard**: A secure portal for administrators to manage products, view system-wide orders, and toggle user roles.
* **Dark Mode & Responsive**: fully responsive across all devices and adapts to light/dark themes.

### Backend (Spring Boot & Java)
* **Spring Security & JWT**: Stateless authentication utilizing JSON Web Tokens. Secures sensitive API endpoints based on user roles (`ROLE_USER` vs `ROLE_ADMIN`).
* **REST API**: Serves data for products, users, and orders.
* **H2 Database**: Fast, in-memory database that wipes on restart for easy prototyping. Includes an initial seed of products and dummy data.
* **Razorpay SDK Integration**: Securely generates verified orders on the server and validates payment workflows.
* **Admin Controls**: Secured endpoints (`/api/admin/**` and `POST/PUT/DELETE /api/products`) ensuring only authorized accounts can manipulate the store's core data.

## Project Structure

```text
NextCart E-Commerce/
├── backend/                  # Spring Boot Java Application
│   ├── src/main/java/...     # Controllers, Models, Repositories, Security configs
│   ├── pom.xml               # Maven Dependencies
│   └── application.properties# Environment configs (Port 8080, Razorpay keys)
│
├── frontend/                 # Next.js Application
│   ├── app/                  # Next.js App Router (Pages: admin, products, cart, checkout)
│   ├── components/           # Reusable React components (HeroBanner, etc.)
│   ├── context/              # React Context providers (Auth, Cart, Wishlist)
│   └── tailwind.config.ts    # Styling theme
```

## Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Java 17+**
* **Maven** (Included in the `apache-maven-3.9.6` folder if you don't have it installed globally)

### Running the Backend (Spring Boot)

1. Open a terminal and navigate to the `backend` directory.
2. Run the application using Maven:
   ```bash
   ..\apache-maven-3.9.6\bin\mvn clean compile spring-boot:run
   ```
3. The server will start on `http://localhost:8080`.

*Note: The H2 database resets whenever the server restarts. To access the Admin dashboard, register a new account with an email ending in `@admin.nc.com`.*

### Running the Frontend (Next.js)

1. Open a separate terminal and navigate to the `frontend` directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Administrator Access

To manage the website (add/edit products, view orders, manage users):
1. Launch both the backend and frontend.
2. Click **Register** in the top navigation.
3. Create an account. To be instantly granted `ROLE_ADMIN` privileges, your email must end with **`@admin.nc.com`** (e.g., `boss@admin.nc.com`).
4. Log in and click the **Admin** link in the navigation bar to access the dashboard.

## Tech Stack
* **Frontend**: Next.js 14, React, Tailwind CSS, Lucide React (Icons).
* **Backend**: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, H2 Database.
* **Payment Gateway**: Razorpay.
