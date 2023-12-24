const mongoose = require('mongoose');
const post = new mongoose.Schema({
    title: String,
    content: String,
    Picture : String
});

const addpost = mongoose.model("addpost", post);
module.exports = addpost;
