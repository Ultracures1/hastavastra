require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { initDatabase } = require("./db/init");
const db = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// API
app.use("/api/storefront", require("./routes/storefront"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/uploads", require("./routes/uploads"));

app.get("/api/health", (req, res) => res.json({ ok: true, db: db.dialect }));

// Uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), { maxAge: "7d" })
);

// Built storefront (app/dist). In development run `npm run dev` inside app/
// instead — Vite proxies /api and /uploads to this server.
const distDir = path.join(__dirname, "app", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res
      .status(200)
      .send(
        "API is running. The storefront is not built yet — run `npm run build` to build app/dist."
      );
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (db: ${db.dialect})`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
