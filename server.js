const express = require('express');

const app = express();

app.use(express.json());

let books = [];

app.get('/', (req, res) => {
    res.send('Library Management System API is running!');
});



app.post('/api/books', (req, res) => {

    const { id, title, author, category, quantity, available } = req.body;

    if (
        id === undefined ||
        !title ||
        !author ||
        !category ||
        quantity === undefined ||
        available === undefined
    ) {
        return res.status(400).json({
            message: 'All fields are required!'
        });
    }

    const existingBook = books.find(book => book.id === id);

    if (existingBook) {
        return res.status(409).json({
            message: 'Book ID already exists!'
        });
    }

    const newBook = {
        id,
        title,
        author,
        category,
        quantity,
        available
    };

    books.push(newBook);

    // Success response
    res.status(201).json({
        message: 'Book added successfully!',
        book: newBook
    });

});




app.put('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);

    const book = books.find(b => b.id === bookId);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found!'
        });
    }

    const { title, author, category, quantity, available, price } = req.body;

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (category !== undefined) book.category = category;
    if (quantity !== undefined) book.quantity = quantity;
    if (available !== undefined) book.available = available;
    if (price !== undefined) book.price = price;

    // Send success response
    res.status(200).json({
        message: 'Book updated successfully!',
        book: book
    });

});



app.delete('/api/books/:id', (req, res) => {

    const bookId = parseInt(req.params.id);

    const bookIndex = books.findIndex(book => book.id === bookId);

    // Check if book exists
    if (bookIndex === -1) {
        return res.status(404).json({
            message: 'Book not found!'
        });
    }

    const deletedBook = books.splice(bookIndex, 1);

    res.status(200).json({
        message: 'Book deleted successfully!',
        book: deletedBook[0]
    });

});


app.get('/api/books', (req, res) => {

    res.status(200).json({
        message: 'Books retrieved successfully!',
        books: books
    });

});


app.get('/api/books/:id', (req, res) => {

    const bookId = parseInt(req.params.id);

    const book = books.find(b => b.id === bookId);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found!'
        });
    }

    res.status(200).json({
        message: 'Book found successfully!',
        book: book
    });

});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});