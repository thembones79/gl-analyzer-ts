import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";
const STATUS = 200;
const glData = JSON.parse(fs.readFileSync("./mock/demo_v2.json", "utf-8"));
const data = () => {
  return {
    changes: JSON.parse(fs.readFileSync("./mock/changes.json", "utf-8")),
    lookup: JSON.parse(fs.readFileSync("./mock/lookup.json", "utf-8")),
    tabs: JSON.parse(fs.readFileSync("./mock/tabs.json", "utf-8")),
    types: JSON.parse(fs.readFileSync("./mock/types.json", "utf-8")),
  };
};
const app = express();
const port = 3000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/gl", (req, res) => {
  if (req.query.d) {
    req.query.d === "perm"
      ? handlePermissions(req, res)
      : res.status(STATUS).json(data()[req.query.d]);
  } else res.status(STATUS).json(glData);
});
app.post("/gl", multer().none(), (req, res) => {
  const content = req.body.json;
  try {
    fs.writeFileSync("./mock/changes.json", content);
  } catch (error) {
    console.error(error);
  }
  res.status(STATUS).json(req.body);
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

const handlePermissions = (req, res) => {
  if (!req.query.user) return res.json({ canEdit: false, editor: null });

  const valid = JSON.parse(fs.readFileSync("./mock/perm.json", "utf-8"));

  const { user } = req.query;
  const timestamp = Date.now();

  const requesting = {
    user,
    timestamp,
  };

  if (requesting.timestamp - valid.timestamp < 10000) {
    if (requesting.user !== valid.user)
      return res.json({ canEdit: false, editor: valid.user });
  }

  try {
    fs.writeFileSync("./mock/perm.json", JSON.stringify(requesting));
  } catch (error) {
    console.error(error);
  }
  res.json({
    canEdit: true,
    editor: requesting.user,
    message: "Turlaj pyzy Kmieciu!!!",
  });
};
