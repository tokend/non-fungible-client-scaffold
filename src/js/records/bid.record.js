export class BidRecord {
  constructor (record) {
    this.id = record.id
    this.ownerId = record.ownerId
    this.baseAsset = record.baseAsset
    this.baseBalanceId = record.baseBalanceId
    this.availableAmount = record.availableAmount
    this.lockedAmount = record.lockedAmount
    this.createdAt = record.createdAt
    this.isCanceled = record.isCanceled
    this.details = record.details
    this.quoteAssets = record.quoteAssets
  }
}
