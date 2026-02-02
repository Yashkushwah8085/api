import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    Name:String,
    Email:{
        type:String,
        unique:true
    },
    Password:String,
    Contact:Number,
    City:String,
    Gender:String,
    RestToken:String,
    RestTokenExpire:Date
})

const UserModel = mongoose.model("collection",UserSchema);

export default UserModel