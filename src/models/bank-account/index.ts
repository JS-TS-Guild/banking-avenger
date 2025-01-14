import { BankAccountId } from "@/types/Common";
import Bank from "@/models/bank";
import GlobalRegistry from "@/services/GlobalRegistry";

export default class BankAccount {
  private id: BankAccountId;
  private bank: Bank;
  private balance: number;

  constructor(bank: Bank, initialBalance: number) {
    this.id = GlobalRegistry.generateId();
    this.bank = bank;
    this.balance = initialBalance;
  }

  getId(): BankAccountId {
    return this.id;
  }

  getBalance(): number {
    return this.balance;
  }

  deposit(amount: number): void {
    if (amount < 0) {
      throw new Error("Deposit amount must be positive");
    }
    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (amount < 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    if (this.balance - amount < 0 && !this.bank.isNegativeBalanceAllowed()) {
      throw new Error("Insufficient funds");
    }

    this.balance -= amount;
  }
}
