import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
        // Get token from header
      token = authorization.split(" ")[1];
      // Verify Token
      const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get User from the token
      req.user = await UserModel.findById(userId).select("-password");
      next();
    } catch (err) {
      res.status(400).json({ status: "Failed", msg: "unauthorized user" });
    }
  }
  if (!token) {
    res.status(400).json({ status: "Failed", msg: "no token" });
  }
};

export default checkUserAuth;