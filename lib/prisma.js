import { PrismaClient } from "@prisma/client";


export const db = globalThis.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}   

//globalThis.prisma = db; // This global variable ensures that the Prisma Client is reused across hot reloads in development mode, preventing the exhaustion of database connections. In production, a new instance of Prisma Client is created for each request.