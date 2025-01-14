import { UserId, BankId } from "@/types/Common";
import User from "@/models/user";
import Bank from "@/models/bank";
import { v4 as uuidv4 } from 'uuid';

export default class GlobalRegistry {
  private static users: Map<UserId, User> = new Map();
  private static banks: Map<BankId, Bank> = new Map();

  static registerUser(user: User): void {
    this.users.set(user.getId(), user);
  }

  static registerBank(bank: Bank): void {
    this.banks.set(bank.getId(), bank);
  }

  static getUser(userId: UserId): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  static getBank(bankId: BankId): Bank {
    const bank = this.banks.get(bankId);
    if (!bank) {
      throw new Error(`Bank not found: ${bankId}`);
    }
    return bank;
  }

  static generateId(): string {
    return uuidv4();
  }

  static clear(): void {
    this.users.clear();
    this.banks.clear();
  }
}
