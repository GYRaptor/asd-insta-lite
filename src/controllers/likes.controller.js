const prisma = require("../db");
const {
  getPostLikes,
  likePost,
  unlikePost,
} = require("../services/likes.service");

const list = async (req, res) => {
  const postId = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const users = await getPostLikes(postId);
  res.status(200).json(users);
};

const create = async (req, res) => {
  const postId = Number(req.params.id);
  const { userId } = req.body;

  // 1. userId missing check
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  // 2. post exists check
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // 3. user exists check
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // 4. insert like and handle 409
  try {
    const like = await likePost(postId, Number(userId));
    res.status(201).json(like);
  } catch (err) {
    res.status(409).json({ error: "Already liked" });
  }
};

const remove = async (req, res) => {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  try {
    await unlikePost(postId, userId);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Like not found" });
  }
};

module.exports = {
  list,
  create,
  remove,
};
