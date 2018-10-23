import { TxRecord } from './tx.record'

import { RECORDS_VERBOSE } from './help/records.const'

export class PublicMatchRecord extends TxRecord {
  constructor (record, asset) {
    super(record, record.type_i === 16 ? RECORDS_VERBOSE.match : RECORDS_VERBOSE.investment)
    this.asset = asset
    this.participants = record.participants || []

    // following works only for the current project
    this.fromAccounts = []
    this.toAccounts = []
    this._getAccounts(record.participants || [])
  }

  _getAccounts (participants) {
    let fromAccounts = []
    let toAccounts = []
    participants.forEach((participant) => {
      if (participant.effects) {
        if (participant.effects[0].is_buy) {
          const isExist = toAccounts.find(toAccount => toAccount.account_id === participant.account_id)
          if (!isExist) {
            participant = this._calcParticipantFields(participant)
            toAccounts.push(participant)
          }
        } else {
          const isExist = fromAccounts.find(fromAccount => fromAccount.account_id === participant.account_id)
          if (!isExist) {
            participant = this._calcParticipantFields(participant)
            fromAccounts.push(participant)
          }
        }
      }
    })
    this.fromAccounts = fromAccounts
    this.toAccounts = toAccounts
    return []
  }

  _calcParticipantFields (participant) {
    let newParticipant = Object.assign({}, participant)
    newParticipant.amount = participant.effects[0].matches.reduce((sum, match) => {
      return sum + +match.base_amount
    }, 0)
    newParticipant.quoteAmount = participant.effects[0].matches.reduce((sum, matche) => {
      return sum + +matche.quote_amount
    }, 0)
    newParticipant.quoteAsset = participant.effects[0].quote_asset
    return newParticipant
  }
}
