import e from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = e();
const port = 3000;
app.use(e.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSongsFromCategory(category) {
  const categoryPath = path.join(__dirname, `public/songs/${category}`);

  if (!fs.existsSync(categoryPath)) return [];

  return fs
    .readdirSync(categoryPath)
    .filter((file) => file.endsWith(".mp3"))
    .map((file) => ({
      name: file,
      url: `/songs/${encodeURIComponent(category)}/${encodeURIComponent(file)}`,
    }));
}
app.get("/songs", (req, res) => {
  const categories = ["English", "Mix", "NoMusic"];
  const songsData = {};

  categories.forEach((category) => {
    songsData[category] = getSongsFromCategory(category);
  });

  res.json(songsData);
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
