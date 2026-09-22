import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check routes for Cloud Run container probes
  app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });

  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0" });
  });

  // Handle Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production with fallback detection
    const possiblePaths = [
      path.join(process.cwd(), "dist"),
      path.join(process.cwd(), "build"),
      path.join(__dirname, "dist"),
      path.join(__dirname, "build"),
      __dirname,
    ];
    const distPath = possiblePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) || possiblePaths[0];
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application index.html not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
