const express = require("express");
const router = express.Router();

const {
  create,
  list,
  getOne,
  update,
  remove,
  listUserPosts,
  listLikedPosts,
} = require("../controllers/users.controller");

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id/posts", listUserPosts);
router.get("/:id/liked-posts", listLikedPosts);

module.exports = router;
