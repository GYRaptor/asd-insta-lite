const express = require("express");
const router = express.Router();

const {
  create,
  list,
  getOne,
  update,
  remove,
} = require("../controllers/posts.controller");
const likesController = require("../controllers/likes.controller");

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

// Like / unlike routes
router.get("/:id/likes", likesController.list);
router.post("/:id/likes", likesController.create);
router.delete("/:id/likes/:userId", likesController.remove);

module.exports = router;
