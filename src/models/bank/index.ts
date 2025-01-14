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

    const fromAccount = this.findAccountWithSufficientFunds(fromUser, amount);
    if (!fromAccount) {
      throw new Error("Insufficient funds across all accounts");
    }

    const toAccount = toBank.getAccount(toUser.getAccountIds()[0]);

    fromAccount.withdraw(amount);
    toAccount.deposit(amount);
  }

  private findAccountWithSufficientFunds(
    user: User,
    amount: number,
  ): BankAccount | null {
    let totalBalance = 0;
    const userAccounts: BankAccount[] = [];

    for (const accountId of user.getAccountIds()) {
      const account = this.accounts.get(accountId);
      if (account) {
        userAccounts.push(account);
        totalBalance += account.getBalance();
      }
    }

    if (totalBalance >= amount || this.isNegativeAllowed) {
      let remainingAmount = amount;
      for (const account of userAccounts) {
        const availableBalance = account.getBalance();
        if (availableBalance >= remainingAmount) {
          return account;
        } else {
          remainingAmount -= availableBalance;
        }
      }

      if (this.isNegativeAllowed) {
        return userAccounts[userAccounts.length - 1];
      }
    }

    return null;
  }

  isNegativeBalanceAllowed(): boolean {
    return this.isNegativeAllowed;
  }
}
