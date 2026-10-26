const prisma = require("../db");
const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../services/posts.service");
const {
  parsePagination,
  formatPaginationMeta,
} = require("../utils/pagination");

const create = async (req, res) => {
  const { imageUrl, authorId, caption, location } = req.body;

  if (!imageUrl || !authorId) {
    return res
      .status(400)
      .json({ error: "imageUrl and authorId are required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(authorId) },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const data = {
    imageUrl,
    authorId: Number(authorId),
  };
  if (caption !== undefined) data.caption = caption;
  if (location !== undefined) data.location = location;

  const result = await createPost(data);
  res.status(201).json(result);
};

const list = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit, skip } = pagination;

  let sortBy = req.query.sortBy || "createdAt";
  const allowedSortBy = ["createdAt", "updatedAt", "likes"];
  if (!allowedSortBy.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt, likes",
    });
  }

  let order = req.query.order || "desc";
  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  let orderBy;
  if (sortBy === "likes") {
    orderBy = [{ likes: { _count: order } }, { createdAt: "desc" }];
  } else {
    orderBy = { [sortBy]: order };
  }

  const where = {};

  if (req.query.location !== undefined && req.query.location !== "") {
    where.location = {
      equals: req.query.location,
      mode: "insensitive",
    };
  }

  if (req.query.search !== undefined && req.query.search !== "") {
    where.caption = {
      contains: req.query.search,
      mode: "insensitive",
    };
  }

  if (req.query.from !== undefined || req.query.to !== undefined) {
    where.createdAt = {};

    if (req.query.from !== undefined) {
      const fromDate = new Date(req.query.from);
      if (isNaN(fromDate.getTime())) {
        return res
          .status(400)
          .json({ error: "from and to must be valid dates" });
      }
      where.createdAt.gte = fromDate;
    }

    if (req.query.to !== undefined) {
      const toDate = new Date(req.query.to);
      if (isNaN(toDate.getTime())) {
        return res
          .status(400)
          .json({ error: "from and to must be valid dates" });
      }
      where.createdAt.lt = toDate;
    }
  }

  const { data, total } = await listPosts({
    skip,
    limit,
    orderBy,
    where,
  });

  res.status(200).json({
    data,
    meta: formatPaginationMeta(page, limit, total),
  });
};

const getOne = async (req, res) => {
  const id = Number(req.params.id);
  const post = await getPostById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.status(200).json(post);
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  const data = {};
  if (req.body.caption !== undefined) data.caption = req.body.caption;
  if (req.body.location !== undefined) data.location = req.body.location;

  try {
    const updatedPost = await updatePost(id, data);
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await deletePost(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
