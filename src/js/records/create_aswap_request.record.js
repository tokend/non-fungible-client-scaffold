import { Sdk } from '@/sdk'

export class CreateAtomicSwapRequestRecord {
  constructor (record) {
    this._record = record.data
    this.envelopeXdr = record.data.envelopeXdr
    this.hash = record.data.hash
    this.ledger = record.data.ledger
    this.resultMetaXdr = record.data.resultMetaXdr
    this.resultXdr = record.data.resultXdr
  }

  result () {
    /*eslint-disable*/
    return Sdk.base.xdr.TransactionResult.fromXDR(new Buffer(this.resultXdr, 'base64'))
    /*eslint-enable*/
  }

  askRequestID () {
    return this.result().result().results()[0].tr().createAtomicSwapRequestResult().success().requestId().toString()
  }
}
