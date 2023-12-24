const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/sample';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
const express = require("express");
const blog = require('./models/blogpost');
const image=require('./models/image');
const multer = require("multer");
const striptags = require('striptags');

const Grid = require("gridfs-stream");
const crypto = require("crypto");
const cors = require("cors");
const app = express();
const path = require("node:path");
const bodyParser = require("body-parser");
const Router = express.Router();
const PORT = process.env.PORT || 3000

db.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

db.once('open', () => {
    console.log('Connected successfully to MongoDB');
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
    res.set({
        'Access-control-Allow-Origin': '*'
    });
    return res.sendFile(path.join(__dirname, 'blog.html'));  // Updated path

}).listen(3000)

// Initialize GridFS
Grid.mongo = mongoose.mongo;

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(upload.single("bimgs"));


app.post('/upload', function (req, res) {
    var name = req.body.title;
    var email = req.body.content;
    var data = {
        "title": name,
        "content": email,       
    }
    console.log(data);
    db.collection('blogs').insertOne(data, function (err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });

    return res.sendFile(path.join(__dirname, 'blog.html'));
})


app.get('/api/insights', async (req, res) => {
    try {
        const insights = await blog.find();

        // Strip HTML tags from the content
        const insightsWithoutTags = insights.map((item) => ({
            ...item._doc,
            content: striptags(item.content)
        }));

        res.json(insightsWithoutTags);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// app.post("/upload", upload.single("bimgs"), (req, res) => {
//     console.log(req.file);
//     const { originalname, buffer } = req.file;

//     const blogData = {
//         title: req.body.title,
//         content: req.body.content,
//         image: {
//             data: buffer,
//             contentType: req.file.mimetype
//         }
//     };

//     db.collection('blog').insertOne(blogData, function (err, collection) {
//         if (err) throw err;
//         console.log("Record inserted Successfully");

//     });
// });