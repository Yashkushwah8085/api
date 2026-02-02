import UserModel from "../model/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { SendEmail } from "../uitls/sendMailer.js";
import crypto from "crypto";


export const UserRegister = async (req, res) => {
    let { Name, Email, Password, City, Contact, Gender } = req.body

    let user = await UserModel.findOne({ Email })
    if (user) return res.status(500).send("user already registered")

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(Password, salt, async (err, hash) => {

            const user = await UserModel.create({
                Name,
                Email,
                Password: hash,
                Contact,
                City,
                Gender
            });

            let Token = jwt.sign({ userid: user._id }, "12345600")
            console.log("Token", Token)

            res.cookie("Token", Token, { httpOnly: true })

            return res.status(201).send({
                message: "user registered successfully ",
                user: {
                    id: user._id,
                    Name: user.Name
                },
                Token,
            })
        })
    })

}

export const UserLogin = async (req, res) => {
    const { Email, Password } = req.body;

    const user = await UserModel.findOne({ Email });
    if (!user) {
        return res.status(404).send({ message: "User Not found" });
    }

    const Ismatch = await bcrypt.compare(Password, user.Password);
    if (!Ismatch) {
        return res.status(401).send({ message: "Invalid Password" });
    }

    const Token = jwt.sign({ Email: user, Email, user }, "ooo")

    res.cookie("Token", Token);

    res.status(200).send({
        message: "User Login Successfully",
        user: {
            id: user._id,
            Name: user.Name,
            Email: user.Email
        },
        Token,
    })
}


export const Updateuser = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Password, Contact, City } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }


    if (Email && Email !== user.Email) {    
      const Exist = await UserModel.findOne({ Email });
      if (Exist) {
        return res.status(400).send({ message: "Email Already exists" });
      }
      user.Email = Email;
    }

    if (Name) user.Name = Name;
    if (Email) user.Email = Email;
    if (Contact) user.Contact = Contact;
    if (City) user.City = City;



    if (Password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(Password, salt);
      user.Password = hash;
    }

    await user.save(); 

    res.status(200).send({
      message: "User Updated Successfully",
      user: {
        id: user._id,
        Name: user.Name,
        Email: user.Email,
        Contact: user.Contact,
        City: user.City,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const LogoutUser = async (req,res) =>{
  res.cookie("Token","",{
    expries: new Date(0),
    httpOnly:true,
  });
   return res.status(200).send({message:" User Logout successfully"})
};

export const ForgotPassword = async (req,res) =>{
  try{
    
  const {Email} = req.body;

  const user = await UserModel.findOne({Email})
  if(!user){
    return res.status(404).send({message:"Email not registered"})
  }

  const ResetToken = crypto.randomBytes(20).toString("hex");

  user.ResetToken = ResetToken
  user.ResetTokenExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const RestLink = `http://localhost:3000/resetpassword/${ResetToken}`;

  const html = `
  <h3>Password Reset</h3>
  <p>Click Link to Restpassword:</p>
  <a href="${RestLink}">${RestLink}</a>
  <p>Valid to 2 minutes</p>
  `;

  await SendEmail(user.Email,"rest password",html);
  res.status(200).send({message:"Rest Link send to mail"});

  } catch(error) {
    res.status(500).send({message:error.message})
  }
};


export const ResetPassword = async (req,res) =>{
  try{
      const {Token, Newpassword} = req.body

      const user = await UserModel.findOne({
        ResetToken: Token,
        ResetTokenExpire: {$gt: Date.now()},
      });
      if(!user){
        res.status(400).send({message:"Invalid or Expired token"})
      }

      const salt = await bcrypt.genSalt(10)
      user.Password = await bcrypt.hash(Newpassword,salt)

      user.ResetToken = undefined;
      user.ResetTokenExpire = undefined;

      await user.save();
      res.status(200).send({message:"password reset successfully"});
  }catch(error) {
     res.status(500).send({message:"error.message"});
  }
};