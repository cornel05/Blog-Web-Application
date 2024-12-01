import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import fs from "fs";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const blogsFilePath = path.join(__dirname, "blogs.json");


app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.engine("ejs", ejs.__express);
app.set("views", path.join(__dirname, "views"));

const readBlogsFromFile = () => {
  if (!fs.existsSync(blogsFilePath)) return [];
  return JSON.parse(fs.readFileSync(blogsFilePath, "utf-8"));
};

const writeBlogsToFile = (blogs) => {
  fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
};

app.get("/", (req, res) => {
  res.render("index.ejs", { blogs: readBlogsFromFile() });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.post("/posts", (req, res) => {
  const blogs = readBlogsFromFile();
  blogs.push({
    title: req.body.title,
    content: req.body.content,
    id: uuidv4(),
    publishMonth: new Date().toLocaleString("default", { month: "long" }),
    publishYear: new Date().getFullYear(),
  });
  writeBlogsToFile(blogs);
  res.redirect("/");
});

const findBlogById = (id) => readBlogsFromFile().find((b) => b.id === id);

app.get("/posts/:id", (req, res) => {
  const blog = findBlogById(req.params.id);
  blog ? res.render("index.ejs", { blog }) : res.status(404).send("Blog post not found");
});

app.get("/posts/:id/edit", (req, res) => {
  const blog = findBlogById(req.params.id);
  blog ? res.render("edit.ejs", { blog }) : res.status(404).send("Blog post not found");
});

app.post("/posts/:id/update-content", (req, res) => {
  const blogs = readBlogsFromFile();
  const blog = blogs.find((b) => b.id === req.params.id);
  if (blog) {
    blog.content = req.body.content;
    writeBlogsToFile(blogs);
    res.redirect(`/posts/${blog.id}`);
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.post("/posts/:id/delete", (req, res) => {
  let blogs = readBlogsFromFile();
  const blogIndex = blogs.findIndex((b) => b.id === req.params.id);
  if (blogIndex !== -1) {
    blogs.splice(blogIndex, 1);
    writeBlogsToFile(blogs);
    res.redirect("/");
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});