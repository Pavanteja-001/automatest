import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma";
import { signSessionToken } from "./jwt";

const SALT_ROUNDS = 10;

export class UserAuthService {
  async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    return {
      user: { id: user.id, email: user.email },
      token: signSessionToken({ userId: user.id }),
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new Error("Invalid email or password.");
    }

    return {
      user: { id: user.id, email: user.email },
      token: signSessionToken({ userId: user.id }),
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email };
  }
}
