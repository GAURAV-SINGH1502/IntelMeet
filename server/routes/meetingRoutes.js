import express from "express";
import Meeting from "../models/Meeting.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post(
  "/create",
  authMiddleware,

  async (req, res) => {

    try {

      const { title } = req.body;

      const meeting = await Meeting.create({
        title,
        host: req.user.id,

        meetingCode:
          Math.random()
          .toString(36)
          .substring(2, 8),
      });

      res.status(201).json({
        message: "Meeting created",
        meeting,
      });

    } catch (error) {
      console.log(error);
    }

  }
);
router.get(
  "/",
  authMiddleware,

  async (req, res) => {

    try {

      const meetings = await Meeting.find();

      res.json(meetings);

    } catch (error) {

      console.log(error);

    }

  }
);
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const meeting = await Meeting.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
        },
        {
          new: true,
        }
      );

      res.json({
        message: "Meeting updated",
        meeting,
      });

    } catch (error) {

      console.log(error);

    }

  }
);
router.delete(
  "/:id",
  authMiddleware,

  async (req, res) => {

    try {

      await Meeting.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "Meeting deleted"
      });

    } catch (error) {

      console.log(error);

    }

  }
);
export default router;