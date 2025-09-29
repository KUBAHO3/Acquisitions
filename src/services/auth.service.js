import logger from "#config/logger.js";
import { db } from "#config/database.js";
import { eq } from "drizzle-orm";
import { users } from "#models/user.model.js";
import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        logger.error(`Error hashing the password: ${error}`)
        throw new Error('Error hashing');
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        logger.error(`Error comparing password: ${error}`);
        throw new Error('Error comparing password');
    }
}

export const createUser = async ({name, email, password, role }) => {
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length > 0) throw new Error('user already exists');

        const passwordHash = await hashPassword(password);

        const [newUser] = await db
        .insert(users)
        .values({name, email, password: passwordHash, role})
        .returning({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt });

        logger.info(`New user created with ID: ${newUser.id} and email: ${newUser.email}`);
        return newUser;
    } catch (error) {
        logger.error(`Error creating user: ${error}`)
        throw error;
    }
}

export const authenticateUser = async ({ email, password }) => {
    try {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        logger.info(`User authenticated successfully: ${user.email}`);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    } catch (error) {
        logger.error(`Error authenticating user: ${error}`);
        throw error;
    }
}
