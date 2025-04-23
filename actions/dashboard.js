"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// This function is used to serialize the transaction object before sending it to the client
// It converts the balance from a BigDecimal to a number for easier handling in the frontend
const serializedTransaction = (transaction) => {
  const serialized = { ...transaction };

  if (transaction.balance) {
    serialized.balance = transaction.balance.toNumber();
  }

  if (transaction.amount) {
    serialized.amount = transaction.amount.toNumber();
  }

  return serialized;
};

export async function createAccount(data) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    // Check if user exists in the database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // check if balance is a number
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance");

    /// check if existing account
    const existingAccount = await db.account.findMany({
      where: { userId: user.id },
    });

    // check default account
    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });

      // Create the new account
      const account = await db.account.create({
        data: {
          ...data,
          balance: balanceFloat,
          userId: user.id,
          isDefault: shouldBeDefault,
        },
      });

      const serializedAccount = serializedTransaction(account);

      revalidatePath("/dashboard");
      return { success: true, data: serializedAccount };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts() {
  // Check if user is authenticated
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  // Check if user exists in the database
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });
  const serializedAccount = accounts.map(serializedTransaction);
  return serializedAccount;
}
