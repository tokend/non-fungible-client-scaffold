import { TokenRecord } from './token.record'
import get from 'lodash/get'
import config from '@/config'

export class ArtRecord extends TokenRecord {
  constructor (record, attachedDetails = {}) {
    super(record, attachedDetails)
  }

  get photoUrl () {
    const key = get(this._record, 'details.photo.key')
    if (!key) return ''
    return `${config.FILE_STORAGE}/${key}`
  }

  get description () {
    return this._record.details.description
  }

  get width () {
    return this._record.details.artWidth
  }

  get height () {
    return this._record.details.artHeight
  }

  get direction () {
    return this._record.details.direction
  }
}
