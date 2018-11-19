import {RecordFactory} from '../records/factory'
import {ErrorFactory, errorTypes} from '../errors/factory'
import store from '../../vuex'

export function parseTransaction (transaction, asset, isPublic) {
  switch (transaction.type_i || transaction.typeI) {
    case 1:
      return RecordFactory.createTransferRecord(transaction, store.getters.accountId)
    case 3:
      return RecordFactory.createIssuanceRecord(transaction)
    case 7:
      return RecordFactory.createWithdrawRecord(transaction)
    case 20:
      if (isPublic) {
        return RecordFactory.createPublicMatchRecord(transaction, asset)
      } else {
        return RecordFactory.createMatchRecord(transaction, asset)
      }
    case 16:
      if (isPublic) {
        return RecordFactory.createPublicMatchRecord(transaction, asset)
      } else {
        return RecordFactory.createMatchRecord(transaction, asset)
      }
    case 18:
      return RecordFactory.createReviewRequestRecord(transaction)
    case 23:
      return RecordFactory.createTransferV2Record(transaction, store.getters.accountId)
    default:
      ErrorFactory.throwError(errorTypes.UnknownTransactionError)
  }
}
