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