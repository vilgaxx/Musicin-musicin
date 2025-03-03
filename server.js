import e from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = e();
const port = 3000;
app.use(e.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const songsDirectory = path.join(__dirname, "public", "songs"); 

const getCategories = () => {
  if (!fs.existsSync(songsDirectory)) return []; 

  return fs
    .readdirSync(songsDirectory)
    .filter((folder) =>
      fs.statSync(path.join(songsDirectory, folder)).isDirectory()
    );
};

const getSongsInCategory = (category) => {
  const categoryPath = path.join(songsDirectory, category);

  if (!fs.existsSync(categoryPath)) return [];

  return fs
    .readdirSync(categoryPath)
    .filter((file) => file.endsWith(".mp3"))
    .map((file) => ({
      name: file,
      url: `/songs/${category}/${encodeURIComponent(file)}`,
    }));
};

app.get("/songs", (req, res) => {
  const categories = getCategories();
  let songsData = {};

  categories.forEach((category) => {
    songsData[category] = getSongsInCategory(category);
  });

  res.json(songsData);
});


app.use("/songs", e.static(songsDirectory));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
