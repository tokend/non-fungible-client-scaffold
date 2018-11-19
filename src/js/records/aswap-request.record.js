import _get from 'lodash/get'

export class AtomicSwapRequest {
  constructor (record) {
    this.id = record.id || '0'
    this.requestor = record.requestor
    this.reviewer = record.reviewer
    this.rejectReason = record.rejectReason
    this.hash = record.hash
    this.createdAt = record.createdAt
    this.updatedAt = record.updatedAt
    this.state = record.requestState
    this.stateI = record.requestStateI
    this.details = record.details
    this.bidId = _get(record, 'details.atomicSwap.bidId')
    this.baseAmount = _get(record, 'details.atomicSwap.baseAmount')
    this.quoteAsset = _get(record, 'details.atomicSwap.quoteAsset')
    this.address = this._getAddress(record)
    this.pendingTasks = record.pendingTasks
  }

  _getAddress (record) {
    const details = _get(record, 'externalDetails.data')
    if (!details) return null
    return details
      .filter(d => d)
      .map(d => d.address || d.Address)[0]
  }
}
