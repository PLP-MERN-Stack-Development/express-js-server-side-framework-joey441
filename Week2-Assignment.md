# Express.js RESTful Product API Assignment

This project implements a complete RESTful API for managing a 'Product' resource using Express.js. It includes comprehensive routing, custom middleware for security and logging, and advanced query features.

## 🚀 Getting Started

1.  **Clone the Repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd express-js-server-side-framework-joey441
    ```

2.  **Install Dependencies:**
    Since the repository did not initially include a `package.json`, the following commands were used to initialize the project and install required dependencies:
    ```bash
    npm init -y
    npm install express body-parser uuid
    ```

3.  **Environment Variables:**
    Create a file named **`.env`** based on the `.env.example` file and set your API key. The application uses the following secret for authentication:
    ```
    # .env file content
    PORT=3000
    API_KEY=PLP_SECRET_KEY 
    ```

4.  **Run the Server:**
    ```bash
    npm start
    ```
    The server will be running at `http://localhost:3000`.

## ⚙️ Middleware Implementation

The API utilizes three custom middleware functions to enforce security and maintain logs:

1.  **Request Logging (`requestLogger`):**
    * **Function:** Logs the timestamp, HTTP method, and URL of every incoming request to the console.
    * **Application:** Applied globally (`app.use(requestLogger)`).

2.  **Authentication (`authenticate`):**
    * **Function:** Checks for the presence and validity of an API key in the `x-api-key` HTTP header.
    * **Requirement:** The header must match the `API_KEY` defined in the environment variables (`PLP_SECRET_KEY`).
    * **Application:** Applied to all routes that modify data (`POST`, `PUT`, `DELETE`).

3.  **Validation (`validateProduct`):**
    * **Function:** Ensures the request body for product creation/update contains the required fields (`name`, `description`, `price`, `category`) and that `price` is a positive number.
    * **Application:** Applied to `POST /api/products` and `PUT /api/products/:id`.

## 🌐 API Endpoints Documentation

All endpoints require the base URL: `http://localhost:3000/api/products`.

### 1. GET /api/products

Retrieves a list of all products. Supports advanced filtering, searching, and pagination via query parameters.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `category` | string | Filters products by category (e.g., `electronics`). |
| `search` | string | Filters products whose `name` or `description` contains the search term. |
| `limit` | number | Limits the number of results per page (default: 10). |
| `page` | number | Specifies the page number to retrieve (default: 1). |

**Example Request (Filtering & Pagination):**

```bash
curl "http://localhost:3000/api/products?category=electronics&limit=1&page=2"