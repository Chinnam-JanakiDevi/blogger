const mongoose=require('mongoose');

const blogSchema = {
    Picture : String
 }
 
 const image = mongoose.model("picture", blogSchema);
 module.exports=image;