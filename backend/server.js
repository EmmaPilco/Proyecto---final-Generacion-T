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



// Dar like o quitar like (toggle)
app.post("/api/posts/:id/like", async (req, res) => {
  const { user_id } = req.body; // id del usuario logueado
  const post_id = req.params.id;

  try {
    // Verificamos si ya existe un like de este usuario en este post
    const existing = await pool.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [post_id, user_id]
    );

    if (existing.rows.length > 0) {
      // Si ya existe → quitar like
      await pool.query(
        "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
        [post_id, user_id]
      );
      return res.json({ success: true, liked: false });
    } else {
      // Si no existe → dar like
      await pool.query(
        "INSERT INTO likes (post_id, user_id) VALUES ($1, $2)",
        [post_id, user_id]
      );
      return res.json({ success: true, liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al dar like" });
  }
});

// Obtener posts con likes + si el usuario actual ya dio like
app.get("/api/posts/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query(`
      SELECT posts.id, posts.content, posts.image_url, posts.created_at,
             users.name AS user_name, users.avatar_url,
             COUNT(likes.id) AS likes,
             -- Chequea si el usuario ya dio like
             BOOL_OR(likes.user_id = $1) AS liked_by_me
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      GROUP BY posts.id, users.name, users.avatar_url
      ORDER BY posts.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener los posts" });
  }
});



// Obtener comentarios de un post
app.get("/api/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(`
      SELECT comments.id, comments.content, comments.created_at,
             users.name AS user_name, users.avatar_url
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC
    `, [postId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al obtener comentarios" });
  }
});

// Crear comentario en un post
app.post("/api/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { user_id, content } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [postId, user_id, content]);

    res.json({ success: true, comment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al crear comentario" });
  }
});

// Obtener perfil de un usuario por su id
app.get("/api/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Datos del usuario
    const userQuery = await pool.query(
      "SELECT id, name, username, email, avatar_url, cover_url, bio FROM users WHERE id = $1",
      [id]
    );
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = userQuery.rows[0];

    // Seguidores (followers) -> cuántos lo siguen
    const followersQuery = await pool.query(
      "SELECT COUNT(*) FROM followers WHERE following_id = $1",
      [id]
    );

    // Seguidos (following) -> a cuántos sigue
    const followingQuery = await pool.query(
      "SELECT COUNT(*) FROM followers WHERE follower_id = $1",
      [id]
    );

    // Publicaciones del usuario
    const postsQuery = await pool.query(
      "SELECT id, content, image_url, created_at, updated_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
      [id]
    );

    res.json({
      user: {
        ...user,
        followers: parseInt(followersQuery.rows[0].count, 10), // lo siguen
        following: parseInt(followingQuery.rows[0].count, 10), // sigue a otros
      },
      posts: postsQuery.rows,
    });
  } catch (err) {
    console.error("❌ Error en /api/profile/:id:", err);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
});



// Actualizar perfil
app.put("/api/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar_url, cover_url, bio } = req.body;

    const updateQuery = await pool.query(
      `UPDATE users 
       SET avatar_url = $1, cover_url = $2, bio = $3
       WHERE id = $4 RETURNING id, name, username, email, avatar_url, cover_url, bio`,
      [avatar_url, cover_url, bio, id]
    );

    res.json({ success: true, user: updateQuery.rows[0] });
  } catch (err) {
    console.error("❌ Error en PUT /api/profile/:id:", err);
    res.status(500).json({ error: "Error actualizando perfil" });
  }
});



app.post("/api/follow/:id", async (req, res) => {
  const followerId = req.user.id; // usuario logueado (desde token)
  const followingId = parseInt(req.params.id);

  if (followerId === followingId) {
    return res.status(400).json({ error: "No puedes seguirte a ti mismo" });
  }

  try {
    await pool.query(
      `INSERT INTO followers (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (follower_id, following_id) DO NOTHING`,
      [followerId, followingId]
    );
    res.json({ followed: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al seguir usuario" });
  }
});

app.delete("/api/follow/:id", async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );
    res.json({ unfollowed: result.rowCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al dejar de seguir usuario" });
  }
});

app.get("/api/followers/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.foto_perfil
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener seguidores" });
  }
});

app.get("/api/following/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.foto_perfil
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener seguidos" });
  }
});



// Obtener amigos (seguimiento mutuo)
app.get("/api/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `
      SELECT u.id, u.name, u.username, u.avatar_url
      FROM users u
      INNER JOIN followers f1 ON f1.following_id = u.id
      INNER JOIN followers f2 ON f2.follower_id = u.id
      WHERE f1.follower_id = $1 AND f2.following_id = $1
      `,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo amigos" });
  }
});



// 🔎 Buscar usuarios
app.get("/api/users/search", async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, name, username, avatar_url 
       FROM users 
       WHERE name ILIKE $1 OR username ILIKE $1
       LIMIT 10`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, username, avatar_url FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo usuarios:", err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});
