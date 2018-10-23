import { TokensService } from './tokens.service'
import { ArtRecord } from '@/js/records/art.record'
import { blobFilters, blobTypes } from '../const/const'
import { accountsService } from './accounts.service'
import { usersService } from './users.service'

export class ArtsService extends TokensService {
  async loadArts (...args) {
    return this.loadTokens(...args)
  }

  async get (...args) {
    const rawArt = await this.loadTokenByCode(...args)
    return new ArtRecord(rawArt)
  }

  /**
   * Loads sale owner details by owner id
   *
   * @param {string|number} owner - owner id
   * @returns {Promise<object>} - Promise object representing syndicate details
   */
  async loadOwner (owner) {
    const filters = {
      // [blobFilters.fundOwner]: owner,
      [blobFilters.type]: blobTypes.syndicate_kyc.num
    }
    const ownerEmail = await accountsService.loadEmailByAccountId(owner)
    const ownerDetails = (await usersService.blobsOf(owner).getAll(filters))[0]
    const syndicate = {
      email: ownerEmail,
      details: ownerDetails
    }
    return syndicate
  }
}

export const artsService = new ArtsService()
