import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const createComment = async (req: Request, res: Response) => {
    try {
        const { postId, content } = req.body;
        if (!postId || !content) {
            return res.status(400).json({
                success: false,
                message: "postId and content are required"
            });
        }

        const postExists = await prisma.post.findUnique({
            where: { id: postId as string }
        });

        if (!postExists) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const result = await prisma.comment.create({
            data: {
                content,
                postId: postId as string,
                authorId: req.user!.userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create comment",
            error: error
        });
    }
};

const getComments = async (req: Request, res: Response) => {
    try {
        const postId = (req.query.postId as string) || (req.body && req.body.postId);
        const whereClause = postId ? { postId: postId as string } : {};

        const result = await prisma.comment.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            message: "Comments retrieved successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve comments",
            error: error
        });
    }
};

const getCommentById = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id as string;

        const result = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Comment retrieved successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve comment",
            error: error
        });
    }
};

const updateComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id as string;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "content is required"
            });
        }

        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Check authorization: only the author of the comment can update it
        if (existingComment.authorId !== req.user!.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this comment"
            });
        }

        const result = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update comment",
            error: error
        });
    }
};

const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id as string;

        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                post: true
            }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Permissions:
        // 1. Comment author can delete
        // 2. Post author (owner of post the comment belongs to) can delete
        // 3. Admin can delete
        const isCommentAuthor = existingComment.authorId === req.user!.userId;
        const isPostAuthor = (existingComment as any).post?.authorId === req.user!.userId;
        const isAdmin = req.user!.role === 'ADMIN';

        if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete comment",
            error: error
        });
    }
};

export const CommentController = {
    createComment,
    getComments,
    getCommentById,
    updateComment,
    deleteComment
};
