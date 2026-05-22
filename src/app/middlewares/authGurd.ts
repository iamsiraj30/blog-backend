import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";


 
const authGurd = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) ; 
 
    req.user = decoded as JwtPayload; 
    next();            

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authGurd;