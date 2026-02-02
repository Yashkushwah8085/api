import express from "express"
import { ForgotPassword, LogoutUser, ResetPassword, Updateuser, UserLogin, UserRegister } from "../controller/user.controller.js"
import upload from "../multer/multer.js"

const router = express.Router()

router.post('/register',UserRegister)
router.post("/login",UserLogin)
router.put("/update/:id",Updateuser)
router.get("/logout",LogoutUser)
router.post("/forgetpassword",ForgotPassword)
router.post("/resetpassword",ResetPassword);
router.post("/upload",upload.single("image"),(req,res) =>{
    if(!req.file){
        return res.status(400).json({
            success:false,
            message:"image upload failed"
        });
    }
    
    res.json({
        success:true,
        message:"image upload successfully",
        filename:req.file.filename,
        imageurl:`/uploads/${req.file.filename}`,
    });
});
export default router