import { Service } from './service'
import { Sdk } from '@/sdk'
import { CreateASwapRequestRecord } from '@/js/records/create_aswap_request.record'

export class BidsService extends Service {
  createBid (opts) {
    const operation = Sdk.base.CreateAtomicSwapBidCreationRequestBuilder.createASwapBidCreationRequest(opts)

    let envelope = new Sdk.base.TransactionBuilder(Sdk.getInstance().wallet.accountId)
      .addOperation(operation)
      .build()
    envelope.sign(Sdk.getInstance().wallet.keypair)
    return Sdk.horizon.transactions.submit(envelope)
  }

  cancelBid (opts) {
    const operation = Sdk.base.CancelAtomicSwapBidBuilder.cancelASwapBid(opts)
    let envelope = new Sdk.base.TransactionBuilder(Sdk.getInstance().wallet.accountId)
      .addOperation(operation)
      .build()
    envelope.sign(Sdk.getInstance().wallet.keypair)
    return Sdk.horizon.transactions.submit(envelope)
  }

  async createASwapRequest (opts) {
    const operation = Sdk.base.CreateAtomicSwapRequestBuilder.createASwapRequest(opts)

    let envelope = new Sdk.base.TransactionBuilder(Sdk.getInstance().wallet.accountId)
      .addOperation(operation)
      .build()
    envelope.sign(Sdk.getInstance().wallet.keypair)

    return new CreateASwapRequestRecord(await Sdk.horizon.transactions.submit(envelope))
  }
}

export const bidsService = new BidsService()
