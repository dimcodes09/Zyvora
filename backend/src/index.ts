import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const start = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(
      `🚀 Server running in ${config.env} mode on port ${config.port}`
    );
  });

  // ── Port-in-use guard ───────────────────────────────────────
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n❌ Port ${config.port} is already in use.\n` +
        `   Run this to free it:\n` +
        `   netstat -ano | findstr :${config.port}   → get PID\n` +
        `   taskkill /PID <PID> /F\n`
      );
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  // ── Graceful shutdown ───────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    server.close(() => process.exit(1));
  });
};

start();