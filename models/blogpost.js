const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    // image: {
    //     data: Buffer,
    //     contentType: String
    // }
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
