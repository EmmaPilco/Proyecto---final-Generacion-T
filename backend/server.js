require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const isRender = process.env.RENDER === "true";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: No se encontró DATABASE_URL en .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


const SECRET_KEY = process.env.SECRET_KEY || "conectiu_secret";

// ----------------- RUTAS -----------------

// Registro de usuario
app.post("/api/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

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
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ success: true, token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al iniciar sesión" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


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

app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    const { user_id, content } = req.body;
    let image_url = null;

    const baseUrl = process.env.RENDER
    ? "https://proyecto-final-generacion-t.onrender.com"
    : "http://localhost:4000";

    if (req.file) {
      image_url = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, content, image_url]
    );

    res.json({ success: true, post: result.rows[0] });
  } catch (err) {
    console.error("Error al crear post:", err);
    res.status(500).json({ message: "Error al crear el post" });
  }
});

app.get("/api/posts/trending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.username,
        u.avatar_url,
        COALESCE(likes_count, 0) AS likes_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS likes_count
        FROM likes
        GROUP BY post_id
      ) lc ON lc.post_id = p.id
      -- WHERE COALESCE(likes_count, 0) > 0
      ORDER BY COALESCE(likes_count, 0) DESC, p.created_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener destacados:", err);
    res.status(500).json({ error: "Error al obtener posts destacados" });
  }
});


app.post("/api/posts/:id/like", async (req, res) => {
  const { user_id } = req.body;
  const post_id = req.params.id;

  try {
    const existing = await pool.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [post_id, user_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
        [post_id, user_id]
      );
      return res.json({ success: true, liked: false });
    } else {
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

    const userQuery = await pool.query(
      "SELECT id, name, username, email, avatar_url, cover_url, bio FROM users WHERE id = $1",
      [id]
    );
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = userQuery.rows[0];

    const followersQuery = await pool.query(
      "SELECT COUNT(*) FROM followers WHERE following_id = $1",
      [id]
    );

    const followingQuery = await pool.query(
      "SELECT COUNT(*) FROM followers WHERE follower_id = $1",
      [id]
    );

    const postsQuery = await pool.query(
      "SELECT id, content, image_url, created_at, updated_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
      [id]
    );

    res.json({
      user: {
        ...user,
        followers: parseInt(followersQuery.rows[0].count, 10),
        following: parseInt(followingQuery.rows[0].count, 10),
      },
      posts: postsQuery.rows,
    });
  } catch (err) {
    console.error("❌ Error en /api/profile/:id:", err);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
});


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
  const { follower_id } = req.body;
  const following_id = parseInt(req.params.id);

  if (follower_id === following_id) {
    return res.status(400).json({ error: "No puedes seguirte a ti mismo" });
  }

  try {
    await pool.query(
      `INSERT INTO followers (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (follower_id, following_id) DO NOTHING`,
      [follower_id, following_id]
    );
    res.json({ success: true, followed: true });
  } catch (err) {
    console.error("Error al seguir usuario:", err);
    res.status(500).json({ error: "Error al seguir usuario" });
  }
});


app.delete("/api/follow/:id", async (req, res) => {
  const { follower_id } = req.body;
  const following_id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
      [follower_id, following_id]
    );
    res.json({ success: true, unfollowed: result.rowCount > 0 });
  } catch (err) {
    console.error("Error al dejar de seguir:", err);
    res.status(500).json({ error: "Error al dejar de seguir usuario" });
  }
});


app.get("/api/follow/check/:followerId/:followingId", async (req, res) => {
  try {
    const followerId = parseInt(req.params.followerId, 10);
    const followingId = parseInt(req.params.followingId, 10);

    const result = await pool.query(
      `SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
      [followerId, followingId]
    );

    res.json({ isFollowing: result.rowCount > 0 });
  } catch (err) {
    console.error("Error en /api/follow/check:", err);
    res.status(500).json({ error: "Error al comprobar follow" });
  }
});


app.get("/api/followers/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.username, u.avatar_url
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener seguidores:", err);
    res.status(500).json({ error: "Error al obtener seguidores" });
  }
});


app.get("/api/following/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.username, u.avatar_url
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener seguidos:", err);
    res.status(500).json({ error: "Error al obtener seguidos" });
  }
});


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



// Buscar usuarios
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


// EVENTOS
// Obtener todos los eventos
app.get("/api/eventos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.titulo,
        e.lugar,
        e.fecha,
        e.created_at,
        u.id AS creador_id,
        u.name AS creador_nombre,
        u.avatar_url,
        COUNT(a.id) AS asistentes_count
      FROM eventos e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN asistencias a ON a.evento_id = e.id
      GROUP BY e.id, u.id
      ORDER BY e.fecha ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
});

// Crear un nuevo evento
app.post("/api/eventos", async (req, res) => {
  const { titulo, lugar, fecha, user_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO eventos (titulo, lugar, fecha, user_id, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [titulo, lugar, fecha, user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).json({ error: "Error al crear evento" });
  }
});

// Asistir / cancelar asistencia
app.post("/api/eventos/asistir", async (req, res) => {
  const { user_id, evento_id } = req.body;

  try {
    // Ver si ya asiste
    const check = await pool.query(
      `SELECT * FROM asistencias WHERE user_id = $1 AND evento_id = $2`,
      [user_id, evento_id]
    );

    if (check.rows.length > 0) {
      await pool.query(
        `DELETE FROM asistencias WHERE user_id = $1 AND evento_id = $2`,
        [user_id, evento_id]
      );
      return res.json({ asistiendo: false });
    } else {
      await pool.query(
        `INSERT INTO asistencias (user_id, evento_id, created_at)
         VALUES ($1, $2, NOW())`,
        [user_id, evento_id]
      );
      return res.json({ asistiendo: true });
    }
  } catch (err) {
    console.error("Error al asistir/cancelar evento:", err);
    res.status(500).json({ error: "Error al actualizar asistencia" });
  }
});

// Obtener eventos del usuario (creados o a los que asiste)
app.get("/api/eventos/usuario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT e.*, u.name AS creador_nombre, u.avatar_url
      FROM eventos e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN asistencias a ON a.evento_id = e.id
      WHERE e.user_id = $1 OR a.user_id = $1
      ORDER BY e.fecha ASC
      `,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener eventos del usuario:", err);
    res.status(500).json({ error: "Error al obtener tus eventos" });
  }
});


//CHAT - Conversaciones y mensajes
app.get("/api/friends/mutual/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT u.id, u.name, u.username, u.avatar_url
      FROM users u
      WHERE u.id IN (
        SELECT f1.following_id
        FROM followers f1
        INNER JOIN followers f2
        ON f1.following_id = f2.follower_id
        WHERE f1.follower_id = $1 AND f2.following_id = $1
      )
      ORDER BY u.name ASC
      `,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener amigos mutuos:", err);
    res.status(500).json({ error: "Error al obtener amigos" });
  }
});

// Obtener mensajes de una conversación
app.get("/api/chat/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT m.*, u.username, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener mensajes:", err);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// Enviar mensaje
app.post("/api/chat/send", async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    let convo = await pool.query(
      `
      SELECT id FROM conversations
      WHERE (user1_id = $1 AND user2_id = $2)
      OR (user1_id = $2 AND user2_id = $1)
      `,
      [sender_id, receiver_id]
    );

    let conversationId;
    if (convo.rows.length > 0) {
      conversationId = convo.rows[0].id;
    } else {
      const newConvo = await pool.query(
        `
        INSERT INTO conversations (user1_id, user2_id)
        VALUES ($1, $2)
        RETURNING id
        `,
        [sender_id, receiver_id]
      );
      conversationId = newConvo.rows[0].id;
    }

    const newMsg = await pool.query(
      `
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [conversationId, sender_id, content]
    );

    res.json({ success: true, message: newMsg.rows[0], conversation_id: conversationId });
  } catch (err) {
    console.error("❌ Error al enviar mensaje:", err);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});


// Obtener mensajes entre dos usuarios
app.get("/api/chat/history/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT m.*, u.username, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
      OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
      `,
      [user1, user2]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener historial:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});
