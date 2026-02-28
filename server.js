const express = require("express");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, "data");

app.use(express.json());
app.use(express.static("public"));

// Ensure data folder exists
fs.ensureDirSync(DATA_DIR);

/* =========================
   PUBLIC: Get All Entries
========================= */
app.get("/api/dex", async (req, res) => {
  const files = await fs.readdir(DATA_DIR);
  const entries = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const data = await fs.readJson(path.join(DATA_DIR, file));
    entries.push(data);
  }

  res.json(entries);
});

/* =========================
   PUBLIC: Get Single Entry
========================= */
app.get("/api/dex/:slug", async (req, res) => {
  const file = path.join(DATA_DIR, `${req.params.slug}.json`);

  if (!(await fs.pathExists(file)))
    return res.status(404).json({ error: "Not found" });

  res.json(await fs.readJson(file));
});

/* =========================
   DEV: Create / Update Entry
========================= */
app.post("/api/admin/create", async (req, res) => {
  const {
    name,
    stage,
    types,
    prior,
    next,
    abilities
  } = req.body;

  if (!name) return res.status(400).json({ error: "Name required" });

  const slug = name.toLowerCase().replace(/\s+/g, "_");

  const entry = {
    name,
    stage,
    types: types || [],
    prior: prior || null,
    next: next || [],
    abilities: abilities || []
  };

  await fs.writeJson(
    path.join(DATA_DIR, `${slug}.json`),
    entry,
    { spaces: 2 }
  );

  res.json({ success: true, slug });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
