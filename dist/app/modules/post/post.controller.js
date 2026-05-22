import { prisma } from "../../lib/prisma";
import fs from 'fs';
import path from 'path';
const createPost = async (req, res) => {
    try {
        const thumbnailPath = req.file ? `/uploads/${req.file.filename}` : null;
        const result = await prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                thumbnail: thumbnailPath,
                authorId: req.user.userId
            }
        });
        res.status(200).json({
            success: true,
            message: "Post created successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create post",
            error: error
        });
    }
};
const getAllPosts = async (req, res) => {
    try {
        const result = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: "Posts retrieved successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve posts",
            // error: error instanceof Error ? error.message : "Unknown error"
            error: error
        });
    }
};
const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content } = req.body;
        const existingPost = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });
        if (!existingPost) {
            throw new Error("Post not found");
        }
        let thumbnail = existingPost.thumbnail;
        if (req.file) {
            thumbnail = `/uploads/${req.file.filename}`;
            // Clean up the old thumbnail file if it exists
            if (existingPost.thumbnail) {
                try {
                    const oldFilename = existingPost.thumbnail.replace('/uploads/', '');
                    const oldFilePath = path.join(process.cwd(), 'uploads', oldFilename);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
                catch (err) {
                    console.error("Failed to delete old thumbnail file:", err);
                }
            }
        }
        const result = await prisma.post.update({
            where: { id: postId },
            data: { title, content, thumbnail }
        });
        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update post",
            // error: error instanceof Error ? error.message : "Unknown error"
            error: error
        });
    }
};
const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const result = await prisma.post.findUnique({
            where: { id: postId }
        });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Post retrieved successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve post",
            // error: error instanceof Error ? error.message : "Unknown error"
            error: error
        });
    }
};
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const existingPost = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });
        if (!existingPost) {
            throw new Error("Post not found");
        }
        await prisma.post.delete({
            where: { id: postId }
        });
        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete post",
            // error: error instanceof Error ? error.message : "Unknown error"
            error: error
        });
    }
};
export const PostController = {
    createPost,
    getAllPosts,
    updatePost,
    getPostById,
    deletePost
};
