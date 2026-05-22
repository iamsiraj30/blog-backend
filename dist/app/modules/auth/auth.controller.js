import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const Register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // find user in database
        const existUser = await prisma.user.findUnique({
            where: {
                email
            }
        });
        // check user already exist or not
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist."
            });
        }
        // make password hashed
        const hashpassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashpassword
            }
        });
        res.status(200).json({
            success: true,
            message: "Registration Successfull",
            data: newUser
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to Register",
            // error: error instanceof Error ? error.message : "Unknown error"
            error: error
        });
    }
};
const Login = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // find user in database
        const existUser = await prisma.user.findUnique({
            where: {
                email
            }
        });
        // check user already exist or not
        if (!existUser) {
            return res.status(400).json({
                message: "Invalid Creadentials"
            });
        }
        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Creadentials"
            });
        }
        const token = jwt.sign({ userId: existUser.id, email: existUser.email, role: existUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            success: true,
            message: "Login Successfull",
            data: {
                user: existUser,
                token
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to Register",
            // error: error instanceof Error ? error.message : "Unknown error"
            error: error
        });
    }
};
export const authController = {
    Register,
    Login
};
