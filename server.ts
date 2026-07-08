import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // SYSTEM INTERNALS - MIDDLEWARE
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // RETRO-FUTURIST TELEMETRY INDICATOR
  console.log("==========================================");
  console.log("         GLITCH_BOARD SYSTEM CORE         ");
  console.log("==========================================");
  console.log("STATUS: INITIALIZING FULL-STACK NETWORK...");

  // BRIDGE NEXT.JS PAGES ROUTER API HANDLERS TO EXPRESS
  // This satisfies the assignment requirement for pages/api/ routes
  app.all("/api/notices", async (req, res) => {
    try {
      // Dynamic import to allow server compilation without static bundling issues
      const { default: handler } = await import("./pages/api/notices/index.js");
      await handler(req, res);
    } catch (error) {
      console.error("[SYS_ERR] Notices root API failure:", error);
      res.status(500).json({ error: "INTERNAL CORE FAILURE", details: String(error) });
    }
  });

  app.all("/api/notices/:id", async (req, res) => {
    try {
      // Inject Express parameters into req.query to match Next.js Pages Router req.query.id structure
      req.query = { ...req.query, id: req.params.id };
      const { default: handler } = await import(`./pages/api/notices/[id].js`);
      await handler(req, res);
    } catch (error) {
      console.error(`[SYS_ERR] Notice dynamic API [${req.params.id}] failure:`, error);
      res.status(500).json({ error: "INTERNAL CORE FAILURE", details: String(error) });
    }
  });

  // FRONTEND INTEGRATION & VITE MIDDLEWARE
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYS_ONLINE] CORE CONDUIT ESTABLISHED AT http://localhost:${PORT}`);
  });
}

startServer();
