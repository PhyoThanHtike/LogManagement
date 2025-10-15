import prisma from "../utils/database.js";

export class UserService {
    static async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        return await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role || 'USER',
                status: userData.status || 'ACTIVE',
                tenant: {
                    connect: { id: userData.tenant }
                },
                loginAttempts: 0,
                isVerified: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    static async findUserById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                loginAttempts: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    static async findUserByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    static async updateUser(id, updateData) {
        const data = { ...updateData };

        // const hashedPassword = await bcrypt.hash(updateData.password, 12);
        
        if (updateData.tenant) {
            data.tenant = {
                connect: { id: updateData.tenant }
            };
        }

        return await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                loginAttempts: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    static async deleteUser(id) {
        return await prisma.user.delete({
            where: { id }
        });
    }

    static async checkEmailExists(email, excludeUserId = null) {
        const where = { email };
        
        if (excludeUserId) {
            where.NOT = {
                id: excludeUserId
            };
        }

        return await prisma.user.findFirst({
            where
        });
    }
}