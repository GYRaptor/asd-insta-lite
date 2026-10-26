const prisma = require("../db");
const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
} = require("../services/users.service");
const {
  parsePagination,
  formatPaginationMeta,
} = require("../utils/pagination");

const create = async (req, res) => {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res
      .status(400)
      .json({ error: "username, email and fullname are required" });
  }

  try {
    const data = { username, email, fullname };
    if (bio !== undefined) {
      data.bio = bio;
    }

    const result = await createUser(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(409).json({ error: "username or email already taken" });
  }
};

const list = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit, skip } = pagination;

  let sortBy = req.query.sortBy || "createdAt";
  const allowedSortBy = ["createdAt", "username", "fullname"];
  if (!allowedSortBy.includes(sortBy)) {
    return res
      .status(400)
      .json({ error: "sortBy must be one of: createdAt, username, fullname" });
  }

  let order = req.query.order || "desc";
  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const where = {};

  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate === "true") {
      where.isPrivate = true;
    } else if (req.query.isPrivate === "false") {
      where.isPrivate = false;
    } else {
      return res
        .status(400)
        .json({ error: "isPrivate must be true or false" });
    }
  }

  if (req.query.search !== undefined && req.query.search !== "") {
    where.OR = [
      { username: { contains: req.query.search, mode: "insensitive" } },
      { fullname: { contains: req.query.search, mode: "insensitive" } },
    ];
  }

  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts === "true") {
      where.posts = { some: {} };
    } else if (req.query.hasPosts === "false") {
      where.posts = { none: {} };
    } else {
      return res.status(400).json({ error: "hasPosts must be true or false" });
    }
  }

  const { data, total } = await listUsers({
    skip,
    limit,
    sortBy,
    order,
    where,
  });

  res.status(200).json({
    data,
    meta: formatPaginationMeta(page, limit, total),
  });
};

const getOne = async (req, res) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  const data = {};
  if (req.body.fullname !== undefined) data.fullname = req.body.fullname;
  if (req.body.bio !== undefined) data.bio = req.body.bio;
  if (req.body.isPrivate !== undefined) data.isPrivate = req.body.isPrivate;

  try {
    const updatedUser = await updateUser(id, data);
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await deleteUser(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const listUserPosts = async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { data, total } = await getUserPosts(id, pagination);

  res.status(200).json({
    data,
    meta: formatPaginationMeta(pagination.page, pagination.limit, total),
  });
};

const listLikedPosts = async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { data, total } = await getUserLikedPosts(id, pagination);

  res.status(200).json({
    data,
    meta: formatPaginationMeta(pagination.page, pagination.limit, total),
  });
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  listUserPosts,
  listLikedPosts,
};
