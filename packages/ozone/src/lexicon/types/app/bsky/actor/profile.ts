/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { lexicons } from '../../../../lexicons'
import { isObj, hasProp } from '../../../../util'
import { CID } from 'multiformats/cid'
import * as AppBskyRichtextFacet from '../richtext/facet'
import * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs'

export interface Record {
  displayName?: string
  /** Free-form profile description text. */
  description?: string
  /** Description annotations (mentions, URLs, hashtags, etc) */
  descriptionFacets?: AppBskyRichtextFacet.Main[]
  /** Small image to be displayed next to posts from account. AKA, 'profile picture' */
  avatar?: BlobRef
  /** Larger horizontal image to display behind profile view. */
  banner?: BlobRef
  labels?:
    | ComAtprotoLabelDefs.SelfLabels
    | { $type: string; [k: string]: unknown }
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.bsky.actor.profile#main' ||
      v.$type === 'app.bsky.actor.profile')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.bsky.actor.profile#main', v)
}
