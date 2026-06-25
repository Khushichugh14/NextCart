# Full E‑Commerce Feature Implementation Plan

## Goal Description
Build an industry‑level Next.js e‑commerce site with comprehensive frontend UI and a Spring Boot backend. Features include:
- Navbar, Hero, Category showcase, Trending/Featured sections (already planned)
- **Product catalog** with filters, sort, pagination, and a responsive grid
- **Product details** page with large images, description, reviews, add‑to‑cart, wishlist
- **Cart** management, **Wishlist**, **Checkout** (Razorpay), **Order tracking**
- **User authentication** using JWT (login, signup, protected routes)
- **Admin dashboard** for product CRUD, order management, reviews moderation
- **Responsive design** with dark‑mode support throughout

## User Review Required
> [!IMPORTANT]
> Please confirm the following preferences before we start implementation:
> - Desired number of products per page (e.g., 12, 16, 20)
> - Sort options you need (e.g., Price Low‑High, High‑Low, Newest)
> - Whether you want to store product reviews locally (JSON) or via the backend API
> - Razorpay credentials (key ID) – you can provide a test key or we can use a placeholder
> - Desired navigation links order (Home, Products, Cart, Wishlist, Checkout, Orders, Profile, Admin)
> - Any specific branding colors or hero image for the landing page (if not, we’ll use placeholders)

## Open Questions
> [!WARNING]
> - **Authentication flow**: Do you want email/password only, or also social login (Google/Facebook)?
> - **User roles**: How many roles? (e.g., `user` and `admin`). Should admin be a separate login route?
> - **Payment**: Will you test Razorpay in sandbox mode? If so, provide the test API key.
> - **Order tracking**: Do you need integration with external carriers (Amazon/Flipkart) or a simple internal status flow?
> - **Reviews**: Should reviews include rating (stars) and text? Any moderation workflow?
> - **Admin dashboard UI**: Preferred layout (sidebar navigation vs top bar) and which entities to manage (Products, Categories, Orders, Users, Reviews)?
> - **Data persistence**: Do you want a simple in‑memory store for demo, or a persistent DB (e.g., H2, PostgreSQL) in the Spring Boot backend?

## Proposed Changes
---
### Frontend (Next.js)
#### Components
- **[NEW] components/Filters.tsx** – UI for category filters, price range, and rating filters.
- **[NEW] components/SortBy.tsx** – Dropdown to select sort order.
- **[NEW] components/Pagination.tsx** – Page navigation with previous/next and page numbers.
- **[NEW] components/ProductGrid.tsx** – Reusable grid displaying product cards with responsive breakpoints.
- **[NEW] pages/products/[id]/page.tsx** – Dynamic product detail page showing large image carousel, description, reviews, "Add to Cart" and "Add to Wishlist" buttons.
- **[NEW] components/ReviewList.tsx** – List existing reviews with star rating.
- **[NEW] components/ReviewForm.tsx** – Form for submitting a new review (authenticated users only).
- **[NEW] components/CartDrawer.tsx** – Slide‑out cart summary with quantity controls.
- **[NEW] components/WishlistDrawer.tsx** – Similar UI for wishlist items.
- **[NEW] components/CheckoutForm.tsx** – Razorpay integration using the Razorpay checkout script.
- **[NEW] components/OrderTracking.tsx** – Simple status tracker UI.
- **[NEW] components/AdminDashboard.tsx** – Layout with sidebar navigation and CRUD tables for products, orders, users, reviews.
- **[NEW] components/AuthGuard.tsx** – Higher‑order component to protect routes using JWT stored in HttpOnly cookies.

#### Pages
- **app/products/page.tsx** – Updated to use `<Filters />`, `<SortBy />`, `<ProductGrid />`, `<Pagination />`.
- **app/products/[id]/page.tsx** – New dynamic route for product details.
- **app/cart/page.tsx** – Cart overview page (uses `<CartDrawer />`).
- **app/wishlist/page.tsx** – Wishlist page.
- **app/checkout/page.tsx** – Checkout page with Razorpay.
- **app/orders/page.tsx** – List of user orders with tracking link.
- **app/profile/page.tsx** – User profile & order history.
- **app/admin/** – Protected admin area with sub‑pages for products, orders, users, reviews.

#### State Management
- Use **React Context** + **useReducer** for cart and wishlist global state.
- Store JWT in **HttpOnly cookie**; fetch user info on app load.
- Create **api/** utility module for calls to Spring Boot backend (`/api/auth`, `/api/products`, `/api/cart`, etc.).

#### Styling
- Extend Tailwind config with custom colors for accent (e.g., `brand-primary`).
- Ensure all new components use glass‑morphism background (`bg-white/30 backdrop-blur`) and micro‑animations (`transition`, `hover:scale-105`).
- Dark‑mode variants for all UI elements.

### Backend (Spring Boot)
#### Core Modules
- **auth** – Controllers for `/signup`, `/login`, JWT generation (`io.jsonwebtoken`), password hashing (BCrypt). Roles (`USER`, `ADMIN`).
- **product** – `Product` entity with fields: `id`, `name`, `description`, `price`, `category`, `imageUrl`, `trending`, `featured`, `rating`, `reviewCount`.
- **review** – `Review` entity: `id`, `productId`, `userId`, `rating`, `comment`, `createdAt`.
- **cart** – `CartItem` entity linked to `User` (in‑memory or DB). Endpoints: `GET /cart`, `POST /cart/add`, `PUT /cart/update`, `DELETE /cart/remove`.
- **wishlist** – Similar to cart.
- **order** – `Order` entity with status enum (`PLACED`, `SHIPPED`, `DELIVERED`, `CANCELLED`). Endpoint for creating order and fetching order list.
- **payment** – Razorpay integration service; endpoint `/payment/create` returns order ID; verify webhook for payment success.
- **admin** – Controllers secured with `@PreAuthorize("hasRole('ADMIN')")` for CRUD operations on products, categories, orders, users, reviews.

#### Security
- Spring Security config with JWT filter (`OncePerRequestFilter`).
- Stateless session; protect `/api/**` except `/auth/**`.
- CORS enabled for `http://localhost:3000`.

#### Persistence
- Use **H2** (in‑memory) for rapid prototyping; optional switch to PostgreSQL.
- Seed database with 50 product entries (matching `products.json`). Include `trending` and `featured` flags.

#### Documentation
- OpenAPI (Swagger) UI at `/swagger-ui.html` for testing.

### Integration
- Frontend `api/` module will call backend endpoints with `fetch` including `Authorization: Bearer <token>` header.
- On successful Razorpay payment, backend verifies and creates an `Order` linked to the user.
- Order tracking page polls `/api/orders/{id}` for status updates.

### Testing & Verification
#### Automated
- Run `npm run dev` – ensure all pages load without errors.
- Execute backend tests: `./mvnw test` for auth, cart, order services.
- End‑to‑end test script (Playwright) to simulate adding a product to cart, checkout, and order tracking.

#### Manual
- Verify UI responsiveness on desktop and mobile.
- Test dark‑mode toggle.
- Perform login, add to cart, wishlist, checkout with Razorpay sandbox.
- Confirm admin CRUD actions work only for admin user.
- Check that reviews appear and can be submitted.

---
## Verification Plan
### Automated Tests
- Frontend lint (`npm run lint`) – zero errors.
- Backend unit tests (`mvn test`).
- End‑to‑end Playwright script covering user flow.

### Manual Verification
- Visual inspection of all new components for design consistency.
- Test JWT auth flow (signup → login → protected routes).
- Checkout flow with Razorpay sandbox.
- Admin dashboard access control.

---
## Timeline (High‑Level)
1. **Week 1** – Backend auth & JWT, product API, initial DB seed.
2. **Week 2** – Frontend filters, sort, pagination, product grid.
3. **Week 3** – Product detail page, reviews, cart & wishlist UI + API integration.
4. **Week 4** – Checkout with Razorpay, order creation, tracking UI.
5. **Week 5** – Admin dashboard, role‑based access, CRUD operations.
6. **Week 6** – polishing, testing, dark‑mode final tweaks, documentation.

---
## Next Steps
- Await your answers to the **Open Questions** above.
- Once clarified, we’ll begin with backend authentication setup and then progress through the frontend feature pipeline.

> [!NOTE]
> All code will follow the premium design guidelines (glass‑morphism, micro‑animations, dark mode) to ensure a wow‑factor UI.
