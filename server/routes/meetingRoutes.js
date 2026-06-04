import express from "express";
import Meeting from "../models/Meeting.js";
import authMiddleware from "../middleware/authMiddleware.js";
import redisClient from "../config/redis.js";

const router = express.Router();

// Create Meeting
router.post(
  "/create",
  authMiddleware,
  async (req, res) => {
    try {

      const { title } = req.body;

      const meeting = await Meeting.create({
        title,
        host: req.user.id,
        meetingCode: Math.random()
          .toString(36)
          .substring(2, 8),
      });

      // Clear cache after creating meeting
      await redisClient.del("meetings");

      res.status(201).json({
        message: "Meeting created",
        meeting,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

// Get All Meetings (Redis Cache)
router.get(
  "/all",
  authMiddleware,
  async (req, res) => {
    try {

      const cachedMeetings =
        await redisClient.get("meetings");

      if (cachedMeetings) {

        console.log(
          "Meetings from Redis Cache"
        );

        return res.json(
          JSON.parse(cachedMeetings)
        );
      }

      const meetings =
        await Meeting.find();

      await redisClient.set(
        "meetings",
        JSON.stringify(meetings)
      );

      console.log(
        "Meetings from MongoDB"
      );

      res.json(meetings);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

// Update Meeting
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {

      const meeting =
        await Meeting.findByIdAndUpdate(
          req.params.id,
          {
            title: req.body.title,
          },
          {
            new: true,
          }
        );

      // Clear cache after update
      await redisClient.del("meetings");

      res.json({
        message: "Meeting updated",
        meeting,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

// Delete Meeting
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {

      await Meeting.findByIdAndDelete(
        req.params.id
      );

      // Clear cache after delete
      await redisClient.del("meetings");

      res.json({
        message: "Meeting deleted",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

export default router;