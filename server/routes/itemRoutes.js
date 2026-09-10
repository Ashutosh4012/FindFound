const express = require("express");
const jwt = require("jsonwebtoken");
const Item = require("../models/Item");

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ==========================================
// CREATE ITEM
// POST /api/items
// ==========================================

router.post("/", authenticateUser, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      date,
      type,
      image,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !location ||
      !date ||
      !type
    ) {
      return res.status(400).json({
        message: "All required fields are required",
      });
    }

    if (!["LOST", "FOUND"].includes(type)) {
      return res.status(400).json({
        message: "Type must be LOST or FOUND",
      });
    }

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      date,
      type,
      image: image || null,
      reportedBy: req.user.userId,
      status: "ACTIVE",
    });

    const populatedItem = await Item.findById(
      item._id
    ).populate(
      "reportedBy",
      "name email studentId"
    );

    return res.status(201).json({
      message: "Report created successfully",
      item: populatedItem,
    });
  } catch (error) {
    console.error("Create item error:", error);

    return res.status(500).json({
      message: "Server error while creating report",
    });
  }
});

// ==========================================
// GET ALL ITEMS
// GET /api/items
// ==========================================

router.get("/", async (req, res) => {
  try {
    const {
      search,
      type,
      status,
    } = req.query;

    const query = {};

    // Type filter
    if (
      type &&
      ["LOST", "FOUND"].includes(type.toUpperCase())
    ) {
      query.type = type.toUpperCase();
    }

    // Status filter
    if (
      status &&
      ["ACTIVE", "CLAIMED", "RESOLVED"].includes(
        status.toUpperCase()
      )
    ) {
      query.status = status.toUpperCase();
    }

    // Search
    if (search && search.trim()) {
      const searchText = search.trim();

      query.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          location: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const items = await Item.find(query)
      .populate(
        "reportedBy",
        "name email studentId"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error);

    return res.status(500).json({
      message: "Server error while loading reports",
    });
  }
});

// ==========================================
// GET MY REPORTS
// GET /api/items/my
// ==========================================

router.get(
  "/my",
  authenticateUser,
  async (req, res) => {
    try {
      const items = await Item.find({
        reportedBy: req.user.userId,
      })
        .populate(
          "reportedBy",
          "name email studentId"
        )
        .sort({
          createdAt: -1,
        });

      return res.json({
        count: items.length,
        items,
      });
    } catch (error) {
      console.error(
        "Get my reports error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// UPDATE STATUS
// PATCH /api/items/:id/status
// ==========================================

router.patch(
  "/:id/status",
  authenticateUser,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "ACTIVE",
        "CLAIMED",
        "RESOLVED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      const item = await Item.findOne({
        _id: req.params.id,
        reportedBy: req.user.userId,
      });

      if (!item) {
        return res.status(404).json({
          message:
            "Report not found or you are not allowed to modify it",
        });
      }

      item.status = status;

      await item.save();

      const updatedItem =
        await Item.findById(item._id).populate(
          "reportedBy",
          "name email studentId"
        );

      return res.json({
        message: "Status updated successfully",
        item: updatedItem,
      });
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// DELETE ITEM
// DELETE /api/items/:id
// ==========================================

router.delete(
  "/:id",
  authenticateUser,
  async (req, res) => {
    try {
      const item = await Item.findOne({
        _id: req.params.id,
        reportedBy: req.user.userId,
      });

      if (!item) {
        return res.status(404).json({
          message:
            "Report not found or you are not allowed to delete it",
        });
      }

      await Item.findByIdAndDelete(req.params.id);

      return res.json({
        message: "Report deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete item error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// GET SINGLE ITEM
// GET /api/items/:id
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(
      req.params.id
    ).populate(
      "reportedBy",
      "name email studentId"
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    return res.json({
      item,
    });
  } catch (error) {
    console.error(
      "Get single item error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;