import { KycRequestRecord } from './kyc_request.record'
import { TransferRecord } from './transfer.record'
import { TokenRecord } from './token.record'
import { TokenCreationRecord } from './token_creation.record'
import { PreIssuanceRequestRecord } from './preissuance_upload.record'
import { ExternalAccountEntity } from './help/external_account_entity'
import { IssuanceRecord } from './issuance.record'
import { WithdrawalRecord } from './withdrawal.record'
import { SaleRecord } from './sale.record'
import { OfferRecord } from './offer.record'
import { MatchRecord } from './match.record'
import { PublicMatchRecord } from './public.match.record'
import { AssetPairRecord } from './asset_pair.record'
import { TradeRecord } from './trade.record'
import { TransferV2Record } from './transferV2.record'
import { SaleCreationRecord } from './sale_creation.record'
import { ArtRecord } from './art.record'
import { BidRecord } from './bid.record'
import { AtomicSwapRequest } from './aswap-request.record'
import { ReviewRequestRecord } from './review_request.record'

export class RecordFactory {
  static createTransferRecord () {
    return new TransferRecord(...arguments)
  }

  static createTransferV2Record () {
    return new TransferV2Record(...arguments)
  }

  static createTokenRecord () {
    return new TokenRecord(...arguments)
  }

  static createTokenСreationRecord () {
    return new TokenCreationRecord(...arguments)
  }

  static createExternalAccountRecord () {
    return new ExternalAccountEntity(...arguments)
  }

  static createIssuanceRecord () {
    return new IssuanceRecord(...arguments)
  }

  static createWithdrawRecord () {
    return new WithdrawalRecord(...arguments)
  }

  static createSaleRecord () {
    return new SaleRecord(...arguments)
  }

  static createSaleCreationRecord () {
    return new SaleCreationRecord(...arguments)
  }

  static createOfferRecord () {
    return new OfferRecord(...arguments)
  }

  static createMatchRecord () {
    return new MatchRecord(...arguments)
  }

  static createPublicMatchRecord () {
    return new PublicMatchRecord(...arguments)
  }

  static createAssetPairRecord () {
    return new AssetPairRecord(...arguments)
  }

  static createTradeRecord () {
    return new TradeRecord(...arguments)
  }

  static createKycRequestRecord () {
    return new KycRequestRecord(...arguments)
  }

  static createPreIssuanceRequestRecord () {
    return new PreIssuanceRequestRecord(...arguments)
  }

  static createArtRecord () {
    return new ArtRecord(...arguments)
  }

  static createBidRecord () {
    return new BidRecord(...arguments)
  }

  static createAtomicSwapRequestRecord () {
    return new AtomicSwapRequest(...arguments)
  }

  static createReviewRequestRecord () {
    return new ReviewRequestRecord(...arguments)
  }
}
