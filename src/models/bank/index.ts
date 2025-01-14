import { BankId, BankAccountId, BankOptions, UserId } from "@/types/Common";
import BankAccount from "@/models/bank-account";
import GlobalRegistry from "@/services/GlobalRegistry";
import User from "@/models/user";

export default class Bank {
  private id: BankId;
  private accounts: Map<BankAccountId, BankAccount> = new Map();
  private isNegativeAllowed: boolean;

  private constructor(options: BankOptions = {}) {
    this.id = GlobalRegistry.generateId();
    this.isNegativeAllowed = options.isNegativeAllowed || false;
  }

  static create(options: BankOptions = {}): Bank {
    const bank = new Bank(options);
    GlobalRegistry.registerBank(bank);
    return bank;
  }

  getId(): BankId {
    return this.id;
  }

  createAccount(initialBalance: number): BankAccount {
    const account = new BankAccount(this, initialBalance);
    this.accounts.set(account.getId(), account);
    return account;
  }

  getAccount(accountId: BankAccountId): BankAccount {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }
    return account;
  }

  send(
    fromUserId: UserId,
    toUserId: UserId,
    amount: number,
    toBankId?: BankId,
  ): void {
    const fromUser = GlobalRegistry.getUser(fromUserId);
    const toUser = GlobalRegistry.getUser(toUserId);
    const toBank = toBankId ? GlobalRegistry.getBank(toBankId) : this;

    const fromAccounts = this.findAccountsWithSufficientFunds(fromUser, amount);
    if (fromAccounts.length === 0) {
      throw new Error("Insufficient funds across all accounts");
    }

    const toAccount = toBank.getAccount(toUser.getAccountIds()[0]);

    let remainingAmount = amount;
    for (const account of fromAccounts) {
      const withdrawalAmount = Math.min(account.getBalance(), remainingAmount);
      account.withdraw(withdrawalAmount);
      remainingAmount -= withdrawalAmount;

      if (remainingAmount === 0) break;
    }

    if (remainingAmount > 0 && this.isNegativeAllowed) {
      fromAccounts[fromAccounts.length - 1].withdraw(remainingAmount);
    }

    toAccount.deposit(amount);
  }

  private findAccountsWithSufficientFunds(
    user: User,
    amount: number,
  ): BankAccount[] {
    const userAccounts: BankAccount[] = [];
    let totalBalance = 0;

    for (const accountId of user.getAccountIds()) {
      const account = this.accounts.get(accountId);
      if (account) {
        userAccounts.push(account);
        totalBalance += account.getBalance();
      }
    }

    if (totalBalance >= amount || this.isNegativeAllowed) {
      return userAccounts;
    }

    return [];
  }

  isNegativeBalanceAllowed(): boolean {
    return this.isNegativeAllowed;
  }
}
