import { TxRecord } from './tx.record'
import { RECORDS_VERBOSE } from './help/records.const'

export class ReviewRequestRecord extends TxRecord {
  constructor (record) {
    super(record, RECORDS_VERBOSE.atomicSwap)
    if (record.type_i) {
      this.requestType = record.details.request_type
      this.creator = record.source_account
      this.holder = record.source_account
      this.amount = record.atomic_swap_details.base_amount
      this.asset = record.atomic_swap_details.base_asset
      this.bidId = record.atomic_swap_details.bid_id
      this.price = record.atomic_swap_details.price
      this.quoteAsset = record.atomic_swap_details.quote_asset
      this.quoteAmount = record.atomic_swap_details.quote_amount
      this.purchaserId = record.atomic_swap_details.purchaser_id
      this.purchaserBaseAssetBalanceId = record.atomic_swap_details.purchaser_base_asset_balance_id
      this.fixedFee = record.operation_fee
      this.bidOwnerId = record.atomic_swap_details.bid_owner_id
      this.bidOwnerBaseAssetBalanceId = record.atomic_swap_details.bid_owner_base_asset_balance_id
      this.isFulfilled = record.is_fulfilled
    }
    if (record.typeI) { // need for new-js-sdk
      this.requestType = record.details.requestType
      this.creator = record.sourceAccount
      this.holder = record.sourceAccount
      this.amount = record.atomicSwapDetails.baseAmount
      this.asset = record.atomicSwapDetails.baseAsset
      this.bidId = record.atomicSwapDetails.bidId
      this.price = record.atomicSwapDetails.price
      this.quoteAsset = record.atomicSwapDetails.quoteAsset
      this.quoteAmount = record.atomicSwapDetails.quoteAmount
      this.purchaserId = record.atomicSwapDetails.purchaserId
      this.purchaserBaseAssetBalanceId = record.atomicSwapDetails.purchaserBaseAssetBalanceId
      this.fixedFee = record.operationFee
      this.bidOwnerId = record.atomicSwapDetails.bidOwnerId
      this.bidOwnerBaseAssetBalanceId = record.atomicSwapDetails.bidOwnerBaseAssetBalanceId
      this.isFulfilled = record.isFulfilled
    }
  }
}
