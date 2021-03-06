import get from 'lodash/get'
import config from '@/config'

export class ArtCreationRecord {
  constructor (record) {
    this.id = record.id || '0'
    this._record = record
    this.tokenCode = get(record, 'details.asset_create.code')
    this.tokenName = get(record, 'details.asset_create.details.name')
    this.direction = get(record, 'details.asset_create.details.direction')
    this.artHeight = get(record, 'details.asset_create.details.artHeight')
    this.artWidth = get(record, 'details.asset_create.details.artWidth')
    this.state = get(record, 'request_state')
    this.stateI = get(record, 'request_state_i')
    this.description = get(record, 'details.asset_create.details.description')
    this.preissuedAssetSigner = get(record, 'details.asset_create.pre_issued_asset_signer')
    this.initialPreissuedAmount = get(record, 'details.asset_create.initial_preissued_amount')
    this.policies = this._getPolicies()
    this.requestID = record.id || 0
    this.photo = get(record, 'details.asset_create.details.photo')
  }

  get photoUrl () {
    const key = get(this._record, 'details.photo.key')
    if (!key) return ''
    return `${config.FILE_STORAGE}/${key}`
  }

  _getPolicies () {
    return get(this._record, 'details.asset_create.policies') ? this._record.details.asset_create.policies.map(policy => policy.value) : []
  }
}
