const express = require('express');
const path = require('path');
const { readJSON } = require('../utils/jsonStore');

const router = express.Router();
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

router.get('/', (req, res) => {
  const products = readJSON(productsFile);
  const categories = [
    { id: 'abarrotes', label: 'Abarrotes' },
    { id: 'bebidas-lacteos', label: 'Bebidas y lácteos' },
    { id: 'limpieza-higiene', label: 'Limpieza e higiene' },
    { id: 'panaderia-snacks', label: 'Panadería y snacks' }
  ];

  res.json(categories.map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.id).length
  })));
});

module.exports = router;
