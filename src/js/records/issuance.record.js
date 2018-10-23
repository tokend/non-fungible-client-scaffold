import { TxRecord } from './tx.record'
import { RECORDS_VERBOSE, DIRECTION_VERBOSE } from './help/records.const'
import get from 'lodash/get'

export class IssuanceRecord extends TxRecord {
  constructor (record, userAccountId) {
    super(record, RECORDS_VERBOSE.issuance)
    this.userAccountId = userAccountId

    this.name = 'Issuance'
    this.amount = record.amount
    this.asset = record.asset
    this.fixedFee = record.fee_fixed
    this.percentFee = record.fee_percent
    this.subject = record.reference
    this.counterparty = this._getCounterparty()
    this.direction = this._getDirection()
    this.creator = record.source_account
    this.holder = record.source_account

    this.creatorEmail = ''
  }

  _getCounterparty () {
    const counterparty =
      (this._record.participants || [])
        .find(participant =>
              participant.account_id !== this.userAccountId
         )
    return get(counterparty, 'account_id') || ''
  }

  _getDirection () {
    return DIRECTION_VERBOSE.in
  }
}
