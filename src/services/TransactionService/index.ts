import { UserId, BankId } from '@/types/Common';
import GlobalRegistry from '@/services/GlobalRegistry';

export default class TransactionService {
  static transfer(fromUserId: UserId, toUserId: UserId, amount: number, fromBankId: BankId, toBankId?: BankId): void {
    const fromBank = GlobalRegistry.getBank(fromBankId);
    fromBank.send(fromUserId, toUserId, amount, toBankId);
  }
}

