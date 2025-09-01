const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Função para gerar o token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // O token expira em 30 dias
  });
};

// ROTA DE REGISTRO: POST /api/users/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // Cria o novo usuário (a senha será criptografada pelo hook do Model)
    const user = await User.create({ email, password });

    // Responde com os dados do usuário e um token de acesso
    res.status(201).json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// ROTA DE LOGIN: POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Procura o usuário pelo email
    const user = await User.findOne({ where: { email } });

    // Se o usuário existir e a senha bater (usando bcrypt para comparar)
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        email: user.email,
        token: generateToken(user.id), // Gera um novo crachá (token)
      });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

module.exports = router;
