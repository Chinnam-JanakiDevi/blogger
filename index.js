const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/sample';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
const express = require("express");
const blog = require('./models/blogpost');
const image = require('./models/image');
const addpost = require('./models/addpost');
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
app.set('view engine', 'ejs')

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
    //   return res.sendFile(path.join(__dirname, 'image.html'));  // Updated path
    // return res.sendFile(path.join(__dirname, 'addpost.html'));  // Updated path
}).listen(3000)
app.get('/addpost', (req, res) => {
    // Renders the 'index.ejs' file using EJS
    return res.sendFile(path.join(__dirname, 'addpost.html'));
});
app.get('/home', (req, res) => {
    // Renders the 'index.ejs' file using EJS
    return res.sendFile(path.join(__dirname, 'home.html'));
});
// Initialize GridFS
Grid.mongo = mongoose.mongo;
express.static('public')
let storage = multer.diskStorage({
    destination: './public/images', //directory (folder) setting
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname) // file name setting
    }
})
let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/gif'

        ) {
            cb(null, true)
        }
        else {
            cb(null, false);
            cb(new Error('Only jpeg,  jpg , png, and gif Image allow'))
        }
    }
})
//mULTIPLE IMAGE UPLODING
app.post('/multiplepost', upload.array('multiple_input', 3), (req, res) => {
    req.files.forEach((singale_image) => {
        image.create({ Picture: singale_image.filename })
            .then((x) => {
                res.redirect('/view')
            })
            .catch((y) => {
                console.log(y)
            })
    })
})
// Example route handler
app.get('/', (req, res) => {
    // Renders the 'index.ejs' file using EJS
    res.render('index');
});
//view details
app.get('/view', (req, res) => {
    addpost.find({})
        .then((posts) => {
            // Remove HTML tags from the content field
            const sanitizedPosts = posts.map(post => {
                return {
                    // _id: post._id,
                    title: post.title,
                    content: striptags(post.content),
                    Picture: post.Picture,
                    __v: post.__v
                };
            });

            res.render('privew', { x: sanitizedPosts });
            console.log(sanitizedPosts);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
});


//add post
app.post('/addpost', upload.array('multiple_input', 3), (req, res) => {
    var title = req.body.title;
    var content= req.body.content;
    // Check if title and content are present
    if (!title || !content) {
        return res.status(400).send('Title and content are required.');
    }

    req.files.forEach((single_image) => {
        addpost.create({ title: title, content: content, Picture: single_image.filename })
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.error(error);
            });
    });

    res.redirect('/view');
});



// Multer configuration for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// app.use(upload.single("bimgs"));


// app.post('/upload', function (req, res) {
//     var name = req.body.title;
//     var email = req.body.content;
//     var data = {
//         "title": name,
//         "content": email,
//     }
//     console.log(data);
//     db.collection('blogs').insertOne(data, function (err, collection) {
//         if (err) throw err;
//         console.log("Record inserted Successfully");
//     });

//     return res.sendFile(path.join(__dirname, 'blog.html'));
// })


// app.get('/api/insights', async (req, res) => {
//     try {
//         const insights = await blog.find();

//         // Strip HTML tags from the content
//         const insightsWithoutTags = insights.map((item) => ({
//             ...item._doc,
//             content: striptags(item.content)
//         }));

//         res.json(insightsWithoutTags);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Internal Server Error'
//         });
//     }
// });

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
