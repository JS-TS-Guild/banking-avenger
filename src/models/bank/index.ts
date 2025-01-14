import { BankId, BankAccountId, BankOptions, UserId } from '@/types/Common';
import BankAccount from '@/models/bank-account';
import GlobalRegistry from '@/services/GlobalRegistry';
import User from '@/models/user';

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

  send(fromUserId: UserId, toUserId: UserId, amount: number, toBankId?: BankId): void {
    const fromUser = GlobalRegistry.getUser(fromUserId);
    const toUser = GlobalRegistry.getUser(toUserId);
    const toBank = toBankId ? GlobalRegistry.getBank(toBankId) : this;

    const fromAccount = this.findAccountWithSufficientFunds(fromUser, amount);
    const toAccount = toBank.getAccount(toUser.getAccountIds()[0]);

    if (!fromAccount) {
      throw new Error('Insufficient funds');
    }

    fromAccount.withdraw(amount);
    toAccount.deposit(amount);
  }

  private findAccountWithSufficientFunds(user: User, amount: number): BankAccount | null {
    for (const accountId of user.getAccountIds()) {
      const account = this.accounts.get(accountId);
      if (account && (account.getBalance() >= amount || this.isNegativeAllowed)) {
        return account;
      }
    }
    return null;
  }

  isNegativeBalanceAllowed(): boolean {
    return this.isNegativeAllowed;
  }
}

