import assert from "node:assert/strict";
import test from "node:test";
import { app, books } from "../server.js";

test("library book API", async (t) => {
  const originalBooks = structuredClone(books);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    books.splice(0, books.length, ...originalBooks);
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  async function request(url, options) {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    });
    return { status: response.status, body: await response.json() };
  }

  await t.test("lists books and searches case-insensitively", async () => {
    const list = await request("/api/books");
    assert.equal(list.status, 200);
    assert.ok(Array.isArray(list.body));
    assert.equal(list.body.length, 1);

    const search = await request("/api/books?search=JAVA");
    assert.equal(search.body.length, 1);
    assert.equal(search.body[0].id, 101);
  });

  let bookId;
  await t.test("creates a book and rejects invalid input", async () => {
    const created = await request("/api/books", {
      method: "POST",
      body: JSON.stringify({
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        quantity: 3,
        available: 2,
      }),
    });
    assert.equal(created.status, 201);
    bookId = created.body.book.id;

    const invalid = await request("/api/books", {
      method: "POST",
      body: JSON.stringify({
        title: "Invalid",
        author: "Author",
        category: "Programming",
        quantity: 1,
        available: 2,
      }),
    });
    assert.equal(invalid.status, 400);
  });

  await t.test("retrieves and updates books without allowing ID changes", async () => {
    const retrieved = await request(`/api/books/${bookId}`);
    assert.equal(retrieved.status, 200);

    const updated = await request(`/api/books/${bookId}`, {
      method: "PUT",
      body: JSON.stringify({ title: "Updated Title" }),
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.book.title, "Updated Title");

    const invalidUpdate = await request(`/api/books/${bookId}`, {
      method: "PUT",
      body: JSON.stringify({ id: 999 }),
    });
    assert.equal(invalidUpdate.status, 400);
    assert.equal((await request(`/api/books/${bookId}`)).body.id, bookId);
  });

  await t.test("deletes books and returns 404 for missing books", async () => {
    const deleted = await request(`/api/books/${bookId}`, { method: "DELETE" });
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.book.id, bookId);
    assert.equal((await request(`/api/books/${bookId}`)).status, 404);
  });

  await t.test("returns clear errors for malformed requests and routes", async () => {
    const invalidId = await request("/api/books/not-a-number");
    assert.equal(invalidId.status, 400);

    const invalidJson = await fetch(`${baseUrl}/api/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{invalid",
    });
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).error, "Request body contains invalid JSON.");

    const missingRoute = await request("/missing");
    assert.equal(missingRoute.status, 404);
  });
});
