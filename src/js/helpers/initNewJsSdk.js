import { Sdk } from '@/sdk'
import { Wallet } from '@tokend/js-sdk'
import config from '@/config'

export async function initializeSDK () {
  await Sdk.init(config.HORIZON_SERVER)
}

export async function initWallet (accountSeed, accountId, walletId) {
  Sdk.sdk
    .useWallet(new Wallet(
      '',
      accountSeed,
      accountId,
      walletId
    ))
}
