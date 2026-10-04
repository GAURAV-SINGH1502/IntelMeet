import express from "express";
import Meeting from "../models/Meeting.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCache, setCache, delCache } from "../config/redis.js";

const router = express.Router();

// Create Meeting
router.post(
  "/create",
  authMiddleware,
  async (req, res) => {
    try {
      const { title } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "Meeting title is required",
        });
      }

      const meetingCode = Math.random()
        .toString(36)
        .substring(2, 8);

      const meeting = await Meeting.create({
        title: title.trim(),
        host: req.user?.id,
        meetingCode,
      });

      // Safely clear cache after creating meeting
      await delCache("meetings");

      return res.status(201).json({
        message: "Meeting created",
        meeting,
      });
    } catch (error) {
      console.error("Create Meeting Error:", error);

      return res.status(500).json({
        message: error.message || "Failed to create meeting",
      });
    }
  }
);

// Get All Meetings (with Redis Cache fallback)
router.get(
  "/all",
  authMiddleware,
  async (req, res) => {
    try {
      const cachedMeetings = await getCache("meetings");

      if (cachedMeetings) {
        try {
          const parsed = JSON.parse(cachedMeetings);
          console.log("Serving meetings from Redis Cache");
          return res.json(parsed);
        } catch (e) {
          console.warn("Error parsing cached meetings JSON, falling back to DB");
        }
      }

      const meetings = await Meeting.find().sort({ createdAt: -1 });

      await setCache(
        "meetings",
        JSON.stringify(meetings),
        120
      );

      console.log("Serving meetings from MongoDB");
      return res.json(meetings);
    } catch (error) {
      console.error("Get Meetings Error:", error);

      return res.status(500).json({
        message: error.message || "Failed to fetch meetings",
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
      const { title } = req.body;

      const meeting = await Meeting.findByIdAndUpdate(
        req.params.id,
        {
          title,
        },
        {
          new: true,
        }
      );

      if (!meeting) {
        return res.status(404).json({
          message: "Meeting not found",
        });
      }

      // Clear cache after update
      await delCache("meetings");

      return res.json({
        message: "Meeting updated",
        meeting,
      });
    } catch (error) {
      console.error("Update Meeting Error:", error);

      return res.status(500).json({
        message: error.message || "Failed to update meeting",
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
      const meeting = await Meeting.findByIdAndDelete(req.params.id);

      if (!meeting) {
        return res.status(404).json({
          message: "Meeting not found",
        });
      }

      // Clear cache after delete
      await delCache("meetings");

      return res.json({
        message: "Meeting deleted",
      });
    } catch (error) {
      console.error("Delete Meeting Error:", error);

      return res.status(500).json({
        message: error.message || "Failed to delete meeting",
      });
    }
  }
);

export default router;