const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const db = require("./db");
const wifeDetailsRoutes = require("./routes/wifeDetailsRoutes");
const personnelRoutes = require("./routes/personnelRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const additionalRoutes = require("./routes/AdditionalColumns");
const bankDetailsRoutes = require("./routes/bankRoutes");
const attendanceRoutes = require("./routes/AttendanceSummary");
const postings = require("./routes/postings");
const leavesRoutes = require("./routes/leaves");
const disciplinaryRoutes = require("./routes/disciplinary");
const qualificationsRoutes = require("./routes/qualifications");
const promotionRoutes = require("./routes/promotion");
const leaveTypesRoutes = require("./routes/leaveTypes");
const coursesRoutes = require("./routes/courses");
const allDelete = require("./routes/allDelete");
const tasksRouter = require("./routes/tasks");
const dynamic = require("./routes/dynamic");
const graph = require("./routes/graph");
const ranks = require("./routes/ranks");
const leavemanagement = require("./routes/leavemanagement");
const personnelDetails = require("./routes/personneldetails");

const moment = require("moment");

const app = express();
const PORT = 5008;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

const upload = multer({ storage: storage });

// Middleware setup
app.use(express.json());
app.use(
  session({
    secret:
      "626d50aeade1d2ea701e706fb707836ac6cd30ea939807c22d6640fe5d5ca67866ec062a5cb7",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using https
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());
// Route setup
app.use("/wifeDetails", wifeDetailsRoutes);
app.use("/personnel", personnelRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/users", userRoutes);
app.use("/additional", additionalRoutes);
app.use("/bank", bankDetailsRoutes);
app.use("/attend", attendanceRoutes);
app.use("/postings", postings);
app.use("/api/leave", leavesRoutes);
app.use("/api/disciplinary_action", disciplinaryRoutes);
app.use("/api/qualifications", qualificationsRoutes);
app.use("/api/promotion", promotionRoutes);
app.use("/api/leave_types", leaveTypesRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/alldelete", allDelete);
app.use("/api/tasks", tasksRouter);
app.use("/dynamic", dynamic);
app.use("/graph", graph);
app.use("/ranks", ranks);
app.use("/leavemanagement", leavemanagement);
app.use("/personneldetails", personnelDetails);

// Database connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err.stack);
    return;
  }
  console.log("Connected to database");
});

app.post("/upload-photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const { service_number, type } = req.body;
  const filename = req.file.filename;

  let query;
  let queryParams;

  if (type === "personal") {
    query = "UPDATE personnel SET photo = ? WHERE service_number = ?";
    queryParams = [filename, service_number];
  } else if (type === "joint") {
    query = "UPDATE wifedetails SET jointphoto = ? WHERE service_number = ?";
    queryParams = [filename, service_number];
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid photo type" });
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error updating database:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error updating database" });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching record found" });
    }

    res.json({
      success: true,
      filename: filename,
      message: "Photo uploaded successfully",
    });
  });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.get("/personnelsearch", (req, res) => {
  const { searchTerm } = req.query;
  const query = `
        SELECT personnel_id, service_number, first_name, last_name 
        FROM personnel 
        WHERE first_name LIKE ? OR last_name LIKE ? OR service_number LIKE ?
    `;
  db.query(
    query,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

app.get("/api/getname/:service_number", (req, res) => {
  const { service_number } = req.params;

  if (!service_number) {
    return res.status(400).json({ error: "No service number provided" });
  }

  const query =
    "SELECT first_name, last_name, service_number FROM personnel WHERE service_number = ?";

  db.query(query, [service_number], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

app.get("/columns", async (req, res) => {
  const { tableName } = req.query;

  if (!tableName) {
    return res.status(400).json({ message: "Table name is required" });
  }

  try {
    const [columns] = await db
      .promise()
      .query(`SHOW COLUMNS FROM ??`, [tableName]);
    res.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ message: "Error fetching columns" });
  }
});
// Delete Column from a Table
app.post("/delete-column", async (req, res) => {
  const { columnName, tableName } = req.body;

  if (!columnName || !tableName) {
    return res
      .status(400)
      .json({ message: "Column name and table name are required" });
  }

  try {
    await db
      .promise()
      .query(`ALTER TABLE ?? DROP COLUMN ??`, [tableName, columnName]);
    res.json({
      message: `Column ${columnName} deleted successfully from ${tableName}`,
    });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ message: "Error deleting column" });
  }
});

// In your routes file, e.g., routes/personnel.js

app.delete("/users/delete/:service_number", async (req, res) => {
  const { service_number } = req.params;

  try {
    // Check if the admin exists
    const [admin] = await db
      .promise()
      .query("SELECT * FROM users WHERE service_number = ?", [service_number]);

    if (admin.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Delete the admin
    await db
      .promise()
      .query("DELETE FROM users WHERE service_number = ?", [service_number]);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
