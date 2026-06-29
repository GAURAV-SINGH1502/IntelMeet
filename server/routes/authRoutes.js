import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
// router.post(
//   "/upload-avatar",
//   upload.single("avatar"),

//   async (req, res) => {

//     try {

//       res.json({
//         message: "Image uploaded",
//         imageUrl: req.file.path,
//       });

//     } catch (error) {
//       console.log(error);
//     }

//   }
// );
router.post(
  "/upload-avatar",
   authMiddleware,
  upload.single("avatar"),
  async (req, res) => {

    try {

      return res.json({
        message: "Image uploaded",
        imageUrl: req.file.path,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: error.message
      });

    }

  }
);
router.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user,
    });

  } catch (error) {
    console.log(error);
  }
});
import jwt from "jsonwebtoken";

router.post("/login", async (req, res) => {
console.log("====== LOGIN API HIT ======");

    console.log(req.body);
  try {

    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // create token
    const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
// refresh token
const refreshToken = jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
);
    res.json({
      message: "Login successful",
      token,
       refreshToken,
       user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
    });

  } catch (error) {
    console.log(err);
  }

});
router.post("/refresh-token", (req, res) => {

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required"
    });
  }

  try {

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const token = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token
    });

  } catch (error) {

    res.status(403).json({
      message: "Invalid refresh token"
    });

  }

});
export default router;