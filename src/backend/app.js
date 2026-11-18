const cors = require('cors');
const express = require('express');
const path = require('path');
const categoriesRouter = require('./routes/categories');
const contactsRouter = require('./routes/contacts');
const productsRouter = require('./routes/products');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/contacts', contactsRouter);
app.use(express.static(frontendPath));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
