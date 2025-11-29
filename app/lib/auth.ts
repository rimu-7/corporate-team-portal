import { Role, User } from "@prisma/client";
import { strict } from "assert";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const jwt_secret = process.env.JWT_SECRET as string;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};
export const verifyPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, jwt_secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, jwt_secret) as { userId: string };
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decode = verifyToken(token);

    const userFromDB = await prisma.user.findUnique({
      where: { id: decode.userId },
    });

    if (!userFromDB) return null;

    const {password, ...user} = userFromDB;
    return user as User;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const userPermission = (user: User, requireRole: Role): boolean =>{
    const roleHierarchy = {
        [Role.GEST]: 0,
        [Role.USER]:1,
        [Role.MANAGER]:2,
        [Role.ADMIN]:3
    }

    return roleHierarchy[user.role] >= roleHierarchy[requireRole]

}
