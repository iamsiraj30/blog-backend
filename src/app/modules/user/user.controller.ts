import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import fs from 'fs';
import path from 'path';

const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve user profile",
            error: error
        });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { name } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let profileImage = existingUser.profileImage;

        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;

            // Clean up the old profileImage file if it exists
            if (existingUser.profileImage) {
                try {
                    const oldFilename = existingUser.profileImage.replace('/uploads/', '');
                    const oldFilePath = path.join(process.cwd(), 'uploads', oldFilename);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (err) {
                    console.error("Failed to delete old profile image file:", err);
                }
            }
        }

        const result = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name !== undefined ? name : existingUser.name,
                profileImage
            },
            select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
                isVerified: true,
                status: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user profile",
            error: error
        });
    }
};

export const UserController = {
    getProfile,
    updateProfile
};
