import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email });
    if (user != null) {
      res.status(400).json({ status: "failed", msg: "Email Already Exists" });
    } else {
      if ((name && email && password && password_confirmation && tc) != null) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(12);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name,
              email,
              password: hashPassword,
              tc,
            });

            //   doc.save();
            const result = await UserModel.insertMany(doc);
            const saved_user = await UserModel.findOne({ email });

            // Generate JWT Token
            const token = jwt.sign(
              { userId: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.status(200).json({
              status: "success",
              msg: "Registration Success",
              token: token,
            });
          } catch (err) {
            res.status(400).json(err);
          }
        } else {
          res.status(400).json({
            status: "failed",
            msg: "password and confirm password doesn't match",
          });
        }
      } else {
        res
          .status(400)
          .json({ status: "failed", msg: "All Fields are Required" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if ((email && password) != null) {
        const user = await UserModel.findOne({ email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch === true) {
            const saved_user = await UserModel.findOne({ email });
            // Generate JWT Token
            const token = jwt.sign(
              { userId: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );

            res.status(200).json({
              status: "success",
              msg: "Login Success",
              token: token,
            });
          } else {
            res.status(400).json({
              status: "failed",
              msg: "Email or Password is incorrect",
            });
          }
        } else {
          res
            .status(400)
            .json({ status: "failed", msg: "Email or Password is incorrect" });
        }
      } else {
        res
          .status(400)
          .json({ status: "failed", msg: "all fields are required" });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password === password_confirmation) {
        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);
        await UserModel.updateOne(
          { _id: req.user._id },
          { $set: { password: hashPassword } }
        );
        res.send({
          status: "success",
          message: "Password changed successfully",
        });
      } else {
        res.status(400).json({
          status: "failed",
          msg: "password and confirm password doesn't match",
        });
      }
    } else {
      res
        .status(400)
        .send({ status: "failed", message: "all fields are required" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        // SEND EMAIL
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "GeekShop -password reset link",
          html: `<a href=${link}>Click Here to Reset you Password</a>`,
        });
        res.status(200).json({
          status: "Success",
          message: "Password Reset Email Sent to Your Registered Email ID",
          info: info,
        });
      } else {
        res
          .status(400)
          .json({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res.status(400).send({ status: "failed", message: "email is required" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password === password_confirmation) {
          const salt = await bcrypt.genSalt(12);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.updateOne(
            { _id: id },
            { $set: { password: newHashPassword } }
          );
          res
            .status(200)
            .json({
              status: "success",
              message: "passoword changed successfully",
            });
        } else {
          res.status(400).json({
            status: "failed",
            msg: "password and confirm password doesn't match",
          });
        }
      } else {
        res
          .status(400)
          .send({ status: "failed", message: "all fields are required" });
      }
    } catch (err) {
      res.status(400).json({ status: "failed", message: "Invalid Token" });
    }
  };
}

export default UserController;
