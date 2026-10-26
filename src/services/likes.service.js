const prisma = require("../db");

const getPostLikes = async (postId) => {
  const likes = await prisma.like.findMany({
    where: { postId },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
    },
    orderBy: {
      user: {
        username: "asc",
      },
    },
  });

  return likes.map((l) => l.user);
};

const likePost = async (postId, userId) => {
  return await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
};

const unlikePost = async (postId, userId) => {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
};

module.exports = {
  getPostLikes,
  likePost,
  unlikePost,
};
