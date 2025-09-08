const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;

// Configuración de CORS y JSON
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",      // tu usuario de postgres
  host: "localhost",
  database: "connectiu",  // la BD que creamos antes
  password: "12345", 
  port: 5432,
});

const SECRET_KEY = "conectiu_secret";

// ----------------- RUTAS -----------------

// Registro de usuario
app.post("/api/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en la Base de datos
    const result = await pool.query(
      "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, username, email",
      [name, username, email, hashedPassword]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al registrar usuario" });
  }
});

// Login de usuario
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    // Crear token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ success: true, token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al iniciar sesión" });
  }
});

// ------------------------------------------

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


// Obtener todos los posts con info del usuario
app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.id, posts.content, posts.image_url, posts.created_at,
             users.name AS user_name, users.avatar_url
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener los posts" });
  }
});

// Crear un nuevo post
app.post("/api/posts", async (req, res) => {
  try {
    const { user_id, content, image_url } = req.body;

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, content, image_url]
    );

    res.json({ success: true, post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear el post" });
  }
});
