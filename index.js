import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import connectDB from "./db.js";
import Blog from "./models/Blog.js";

const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.engine("ejs", ejs.__express);
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  const blogs = await Blog.find();
  res.render("index.ejs", { blogs: blogs });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.post("/posts", async (req, res) => {
  const today = new Date();
  const blog = new Blog({
    title: req.body.title,
    content: req.body.content,
    id: uuidv4(),
    publishMonth: today.toLocaleString("default", { month: "long" }),
    publishYear: today.getFullYear(),
  });
  await blog.save();
  res.redirect("/");
});

app.get("/posts/:id", async (req, res) => {
  const blog = await Blog.findOne({ id: req.params.id });
  if (blog) {
    res.render("index.ejs", { blog: blog });
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.get("/posts/:id/edit", async (req, res) => {
  const blog = await Blog.findOne({ id: req.params.id });
  if (blog) {
    res.render("edit.ejs", { blog: blog });
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.post("/posts/:id/update-content", async (req, res) => {
  const blog = await Blog.findOne({ id: req.params.id });
  if (blog) {
    if (req.body.content) blog.content = req.body.content;
    await blog.save();
    res.redirect(`/posts/${blog.id}`);
  } else {
    res.status(404).send("Blog post not found");
  }
});

app.post("/posts/:id/delete", async (req, res) => {
  const blog = await Blog.findOneAndDelete({ id: req.params.id });
  if (blog) {
    res.redirect("/");
  } else {
    res.status(404).send("Blog post not found");
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.setTimeout(10000); // Increase server timeout to 5 seconds