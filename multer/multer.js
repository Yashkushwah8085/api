import { error } from "console";
import multer from "multer";
import path from "path";


const Storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,"upload")
    },

    filename: (req,file,cb) => {

        const fn = Date.now() + path.extname(file.originalname);
        cb(null,fn)
    },
});

   const fileFilter = (req,file,cb) =>{
    if(
        file.mimetype === "image.jpeg" || file.mimetype === "image.jpg"
    ){
        cb(null,true)
    }else{
        cb(new error("only image  files allowed"),false)
    }
   };

   const upload = multer({
    Storage,
    limits:{
        fileSize: 1024*1024*5
    },
    fileFilter,
   });

   export default upload;