const express = require('express');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/jsonStore');

const router = express.Router();
const contactsFile = path.join(__dirname, '..', 'data', 'contacts.json');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'El nombre es requerido.' });
  }

  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'Email inválido.' });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }

  const contacts = readJSON(contactsFile);
  contacts.push({
    id: Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || '',
    subject: subject?.trim() || 'Consulta general',
    message: message.trim(),
    createdAt: new Date().toISOString()
  });
  writeJSON(contactsFile, contacts);

  return res.status(201).json({
    success: true,
    message: '¡Mensaje recibido! Te contactaremos pronto.'
  });
});

module.exports = router;
