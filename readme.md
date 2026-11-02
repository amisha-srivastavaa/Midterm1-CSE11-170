# Library Management System — Midsem Practical

## Run

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

The server runs at `http://127.0.0.1:3000`. It binds to localhost for local practical use and stores sample books in memory; restarting the server resets changes.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/books` | List all books |
| `GET` | `/api/books?search=java` | Search by title, author, or category |
| `GET` | `/api/books/:id` | Get a book by ID |
| `POST` | `/api/books` | Add a book |
| `PUT` | `/api/books/:id` | Update a book |
| `DELETE` | `/api/books/:id` | Delete a book |

### Example `POST /api/books` request

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "quantity": 5,
  "available": 5
}
```

The title, author, and category must be non-empty strings. Quantity and available copies must be non-negative whole numbers, and available copies cannot exceed the total quantity. `PUT` accepts one or more of these fields and does not allow changing a book's ID.

## Tests

```bash
npm test
```