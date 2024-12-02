const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.json(updateBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById({ _id: id })
      .populate("likes")
      .populate("dislikes");
    const updateViews = await Blog.findByIdAndUpdate(
      { _id: id },
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(getBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const getBlogs = await Blog.find();
    res.json(getBlogs);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const deletedBlog = await Blog.findByIdAndDelete({ _id: id });
    res.json(deleteBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  // Lấy thông tin người dùng từ req.user (đã được gán trong middleware authMiddleware)
  const userId = req.user._id;

  // Tìm blog mà người dùng muốn like
  const blog = await Blog.findById(blogId);
  // Kiểm tra xem người dùng đã like blog này chưa
  const isLiked = blog?.isLiked;

  // Kiểm tra xem người dùng đã dislike blog này chưa
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === userId.toString()
  );

  // Nếu người dùng đã dislike blog, bỏ dislike
  if (alreadyDisliked) {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: userId },
        isDisliked: false,
      },
      { new: true }
    );
    return res.json(updatedBlog);
  }

  if (isLiked) {
    // Nếu đã like, bỏ like
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: userId },
        isLiked: false,
      },
      { new: true }
    );
    return res.json(updatedBlog);
  } else {
    // Nếu chưa like và chưa dislike, dislike blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: userId },
        isLiked: true,
      },
      { new: true }
    );
    return res.json(updatedBlog);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  // Lấy thông tin người dùng từ req.user (đã được gán trong middleware authMiddleware)
  const userId = req.user._id;

  // Tìm blog mà người dùng muốn like
  const blog = await Blog.findById(blogId);

  // Kiểm tra xem người dùng đã like blog này chưa
  const isDisliked = blog?.isDisliked;
  // Kiểm tra xem người dùng đã dislike blog này chưa
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === userId.toString()
  );

  // Nếu người dùng đã dislike blog, bỏ dislike
  if (alreadyLiked) {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: userId },
        isLiked: false,
      },
      { new: true }
    );
    return res.json(updatedBlog);
  }

  if (isDisliked) {
    // Nếu đã like, bỏ like
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: userId },
        isDisliked: false,
      },
      { new: true }
    );
    return res.json(updatedBlog);
  } else {
    // Nếu chưa like và chưa dislike, dislike blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: userId },
        isDisliked: true,
      },
      { new: true }
    );
    return res.json(updatedBlog);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log(newpath);
      urls.push(newpath);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      { _id: id },
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
