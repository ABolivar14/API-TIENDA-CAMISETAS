require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a la base de datos');
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'principal.html'));
});



app.get('/api/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, resultados) => {
    if (err) return res.status(500).json(err);
    res.json(resultados);
  });
});

app.post('/api/usuarios', (req, res) => {
  const { nombre, email, contraseña, saldo, estado } = req.body;
  const fecha = new Date().toLocaleDateString('sv-SE');

  if (!nombre || !email || !contraseña || !estado) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }

  const sql = `INSERT INTO usuarios (nombre, email, contraseña, saldo, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [nombre, email, contraseña, saldo || 0.0, fecha, estado], (err, resultado) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: resultado.insertId });
  });
});

app.put('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const datos = req.body;

  db.query('UPDATE usuarios SET ? WHERE id = ?', [datos, id], (err, resultado) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: 'Usuario actualizado' });
  });
});

app.delete('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, resultado) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: 'Usuario eliminado' });
  });
});


app.get('/api/eventos', (req, res) => {
  db.query('SELECT * FROM Eventoss', (err, resultados) => {
    if (err) return res.status(500).json(err);
    res.json(resultados);
  });
});

app.post('/api/eventos', (req, res) => {
  const { nombre, fecha, descripcion } = req.body;

  if (!nombre || !fecha) {
    return res.status(400).json({ mensaje: 'Nombre y fecha son obligatorios' });
  }

  const sql = `INSERT INTO Eventoss (nombre, fecha, descripcion) VALUES (?, ?, ?)`;
  db.query(sql, [nombre, fecha, descripcion || null], (err, resultado) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: resultado.insertId });
  });
});

app.put('/api/eventos/:id', (req, res) => {
  const id = req.params.id;
  const datos = req.body;

  db.query('UPDATE Eventoss SET ? WHERE id = ?', [datos, id], (err, resultado) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: 'Evento actualizado' });
  });
});

app.delete('/api/eventos/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Eventoss WHERE id = ?', [id], (err, resultado) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: 'Evento eliminado' });
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
