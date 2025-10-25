// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_API_KEY = process.env.API_KEY || 'PLP_SECRET_KEY'; 

// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
    {
        id: '1',
        name: 'Laptop',
        description: 'High-performance laptop with 16GB RAM',
        price: 1200,
        category: 'electronics',
        inStock: true
    },
    {
        id: '2',
        name: 'Smartphone',
        description: 'Latest model with 128GB storage',
        price: 800,
        category: 'electronics',
        inStock: true
    },
    {
        id: '3',
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with timer',
        price: 50,
        category: 'kitchen',
        inStock: false
    }
];

// --- CUSTOM MIDDLEWARE IMPLEMENTATION ---

// 1. Logging Middleware
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
app.use(requestLogger);

// 2. Authentication Middleware
const authenticate = (req, res, next) => {
    
    const apiKey = req.header('x-api-key');
    if (!apiKey || apiKey !== AUTH_API_KEY) {
        return res.status(401).json({ 
            error: 'Access Denied', 
            message: 'Invalid or missing API key. Use x-api-key header.' 
        });
    }
    
    next();
};


const validateProduct = (req, res, next) => {
    const { name, description, price, category } = req.body;
    
    if (!name || !description || !price || !category) {
        return res.status(400).json({ 
            error: 'Bad Request', 
            message: 'Missing required fields: name, description, price, and category are required.' 
        });
    }
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ 
            error: 'Bad Request', 
            message: 'Price must be a positive number.' 
        });
    }
    
    next();
};

// --- RESTFUL API ENDPOINTS ---

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Product API! Go to /api/products to see all products.');
});


app.get('/api/products', (req, res) => {
    let result = [...products]; 
    const { category, search, limit, page } = req.query;

    // 1. Filtering by Category
    if (category) {
        result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Searching
    if (search) {
        const searchTerm = search.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // 3. Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    const paginatedProducts = result.slice(startIndex, endIndex);

    res.json({
        total: result.length,
        page: pageNum,
        limit: limitNum,
        data: paginatedProducts
    });
});


app.get('/api/products/:id', (req, res, next) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        
        const error = new Error(`Product with ID ${req.params.id} not found.`);
        error.statusCode = 404;
        return next(error);
    }
    res.json(product);
});


app.post('/api/products', authenticate, validateProduct, (req, res) => {
    const newProduct = {
        id: uuidv4(), 
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        
        inStock: req.body.inStock !== undefined ? req.body.inStock : true
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});


app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        const error = new Error(`Product with ID ${req.params.id} not found and cannot be updated.`);
        error.statusCode = 404;
        return next(error);
    }

    
    products[index] = {
        ...products[index],
        ...req.body,
        id: req.params.id 
    };

    res.json(products[index]);
});


app.delete('/api/products/:id', authenticate, (req, res, next) => {
    const initialLength = products.length;
    products = products.filter(p => p.id !== req.params.id);

    if (products.length === initialLength) {
        const error = new Error(`Product with ID ${req.params.id} not found and cannot be deleted.`);
        error.statusCode = 404;
        return next(error);
    }

    res.status(204).send(); 
});

// --- ERROR HANDLING ---

app.use((req, res, next) => {
    const error = new Error(`Resource Not Found: The requested URL ${req.originalUrl} does not exist.`);
    error.statusCode = 404;
    next(error);
});


app.use((err, req, res, next) => {
    // Default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred on the server.';

    console.error(err.stack); 

    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: message,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
