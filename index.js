import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const blogsFilePath = path.join(__dirname, "blogs.json");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "views")); // Assuming 'views' is in the same level as the root folder

// Helper function to read blogs from the JSON file
const readBlogs = () => {
  try {
    const data = fs.readFileSync(blogsFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper function to write blogs to the JSON file
const writeBlogs = (blogs) => {
  fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
};

app.get("/", (req, res) => {
  const blogs = readBlogs();
  res.render("index.ejs", { blogs: blogs });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.post("/posts", (req, res) => {
  const today = new Date();
  const blog = {
    title: req.body.title,
    content: req.body.content,
    id: uuidv4(),
    publishMonth: today.toLocaleString("default", { month: "long" }),
    publishYear: today.getFullYear(),
  };
  const blogs = readBlogs();
  blogs.push(blog);
  writeBlogs(blogs);
  console.log(blog);
  res.redirect("/");
});

app.get("/posts/:id", (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find((blog) => blog.id === req.params.id);
  if (blog) {
    res.render("index.ejs", { blog: blog });
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.get("/posts/:id/edit", (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find((blog) => blog.id === req.params.id);
  if (blog) {
    res.render("edit.ejs", { blog: blog });
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.post("/posts/:id/update-content", (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find(blog => blog.id === req.params.id);
  if (blog) {
    if (req.body.content) blog.content = req.body.content;
    writeBlogs(blogs);
    res.redirect(`/posts/${blog.id}`);
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.post("/posts/:id/delete", (req, res) => {
  let blogs = readBlogs();
  const blogIdx = blogs.findIndex(blog => blog.id === req.params.id);
  if (blogIdx !== -1) {
    blogs.splice(blogIdx, 1);
    writeBlogs(blogs);
    res.redirect("/");
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});