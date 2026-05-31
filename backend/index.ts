import { config } from "dotenv";

config({ path: `.env.${process.env["NODE_ENV"] ?? "development"}` });

const { default: db } = await import("./db.js");
const { createApp } = await import("./server.js");

const PORT = 3001;
const app = createApp(db);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`DarWars API running at http://localhost:${PORT}`);
});
