import { UserId, BankAccountId } from "@/types/Common";
import GlobalRegistry from "@/services/GlobalRegistry";

export default class User {
  private id: UserId;
  private name: string;
  private accountIds: BankAccountId[];

  private constructor(name: string, accountIds: BankAccountId[]) {
    this.id = GlobalRegistry.generateId();
    this.name = name;
    this.accountIds = accountIds;
  }

  static create(name: string, accountIds: BankAccountId[]): User {
    const user = new User(name, accountIds);
    GlobalRegistry.registerUser(user);
    return user;
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getAccountIds(): BankAccountId[] {
    return this.accountIds;
  }

  addAccount(accountId: BankAccountId): void {
    this.accountIds.push(accountId);
  }
}
