const mongoose=require('mongoose');

const blogSchema = {
    image: {
        data: Buffer,
        contentType: String
    }
 }
 
 const image = mongoose.model("image", blogSchema);
 module.exports=image;