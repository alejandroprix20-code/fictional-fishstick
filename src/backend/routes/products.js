const express = require('express');
const path = require('path');
const { readJSON } = require('../utils/jsonStore');

const router = express.Router();
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

router.get('/', (req, res) => {
  let products = readJSON(productsFile);
  const { search, category, featured } = req.query;

  if (category && category !== 'todos') {
    products = products.filter((product) => product.category === category);
  }

  if (search) {
    const query = search.toLowerCase().trim();
    products = products.filter((product) =>
      product.name.toLowerCase().includes(query)
      || product.description.toLowerCase().includes(query)
      || product.category.toLowerCase().includes(query)
    );
  }

  if (featured === 'true') {
    products = products.filter((product) => product.featured);
  }

  res.json(products);
});

router.get('/:id', (req, res) => {
  const products = readJSON(productsFile);
  const product = products.find((item) => item.id === Number.parseInt(req.params.id, 10));

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.json(product);
});

module.exports = router;
