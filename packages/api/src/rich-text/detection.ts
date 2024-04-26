import TLDs from 'tlds'
import { AppBskyRichtextFacet } from '../client'
import { UnicodeString } from './unicode'
import {
  END_PUNCTUATION_REGEX,
  MENTION_REGEX,
  TAG_REGEX,
  TRAILING_PUNCTUATION_REGEX,
  URL_REGEX,
} from './util'

export type Facet = AppBskyRichtextFacet.Main

export function detectFacets(text: UnicodeString): Facet[] | undefined {
  let match: RegExpExecArray | null
  const facets: Facet[] = []
  {
    // mentions
    const re = MENTION_REGEX
    while ((match = re.exec(text.utf16))) {
      if (!isValidDomain(match[3]) && !match[3].endsWith('.test')) {
        continue // probably not a handle
      }

      const start = text.utf16.indexOf(match[3], match.index) - 1
      facets.push({
        $type: 'app.bsky.richtext.facet',
        index: {
          byteStart: text.utf16IndexToUtf8Index(start),
          byteEnd: text.utf16IndexToUtf8Index(start + match[3].length + 1),
        },
        features: [
          {
            $type: 'app.bsky.richtext.facet#mention',
            did: match[3], // must be resolved afterwards
          },
        ],
      })
    }
  }
  {
    // links
    const re = URL_REGEX
    while ((match = re.exec(text.utf16))) {
      let uri = match[1]

      if (match[3]) {
        const domain = match[3]
        if (!domain || !isValidDomain(domain)) {
          continue
        }

        uri = `https://${uri}`
      }

      const trimmed = uri.replace(END_PUNCTUATION_REGEX, '')

      const start = text.utf16.indexOf(match[1], match.index)
      const end = start + match[1].length - (uri.length - trimmed.length)

      facets.push({
        index: {
          byteStart: text.utf16IndexToUtf8Index(start),
          byteEnd: text.utf16IndexToUtf8Index(end),
        },
        features: [
          {
            $type: 'app.bsky.richtext.facet#link',
            uri: trimmed,
          },
        ],
      })
    }
  }
  {
    const re = TAG_REGEX
    while ((match = re.exec(text.utf16))) {
      let [, leading, tag] = match

      if (!tag) continue

      // strip ending punctuation and any spaces
      tag = tag.trim().replace(TRAILING_PUNCTUATION_REGEX, '')

      if (tag.length === 0 || tag.length > 64) continue

      const index = match.index + leading.length

      facets.push({
        index: {
          byteStart: text.utf16IndexToUtf8Index(index),
          byteEnd: text.utf16IndexToUtf8Index(index + 1 + tag.length),
        },
        features: [
          {
            $type: 'app.bsky.richtext.facet#tag',
            tag: tag,
          },
        ],
      })
    }
  }
  return facets.length > 0 ? facets : undefined
}

function isValidDomain(str: string): boolean {
  return !!TLDs.find((tld) => {
    const i = str.lastIndexOf(tld)
    if (i === -1) {
      return false
    }
    return str.charAt(i - 1) === '.' && i === str.length - tld.length
  })
}
