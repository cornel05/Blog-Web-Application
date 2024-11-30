// models/Blog.js
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  publishMonth: {
    type: String,
    required: true,
  },
  publishYear: {
    type: Number,
    required: true,
  },
});

const Blog = mongoose.model('Blog', BlogSchema);

export default Blog;