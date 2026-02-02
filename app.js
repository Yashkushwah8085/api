import express from "express"
import cookieParser from "cookie-parser";
import UserRouter from "./router/user.router.js"
import DataBase from "./config/mongoose.connection.js"
import Cors from "cors"
const app = express()

app.use(Cors({
    origin:"*",
    credentials:true,
    methods:["POST","GET","PUT","PATCH","DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/user",UserRouter)


app.listen(3000);
console.log("server invoked at link http://localhost:3000")