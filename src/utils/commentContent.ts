import { Comment } from '@/payload-types'

export function extractTextFromLexicalContent(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const nodeObj = node as Record<string, unknown>

  if (nodeObj.type === 'text' && typeof nodeObj.text === 'string') {
    return nodeObj.text
  }

  if (Array.isArray(nodeObj.children)) {
    return nodeObj.children.map(extractTextFromLexicalContent).join('')
  }

  return ''
}

export function isLexicalContent(content: unknown): boolean {
  if (!content || typeof content !== 'object') return false
  const contentObj = content as Record<string, unknown>
  const root = contentObj.root
  return (
    root !== null &&
    root !== undefined &&
    typeof root === 'object' &&
    (root as Record<string, unknown>).type === 'root'
  )
}

export function isStringContent(content: unknown): boolean {
  return typeof content === 'string'
}

export function getCommentContent(comment: Comment): string | object {
  const richContent = comment.richContent
  if (
    richContent != null &&
    typeof richContent === 'object' &&
    !Array.isArray(richContent) &&
    richContent !== null
  ) {
    return richContent as object
  }
  const content = comment.content
  if (typeof content === 'string') {
    return content
  }
  return ''
}

export function convertStringToLexical(text: string) {
  const lines = text.split('\n')

  const children = lines.map((line) => ({
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: line,
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }))

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export function extractCommentText(comment: Comment): string {
  if (comment.richContent && isLexicalContent(comment.richContent)) {
    const richContentObj = comment.richContent as Record<string, unknown>
    return extractTextFromLexicalContent(richContentObj.root).trim()
  }
  return (comment.content as string) || ''
}

function normalizeLinkNodes(node: unknown): unknown {
  if (!node || typeof node !== 'object') return node

  const nodeObj = node as Record<string, unknown>

  let normalizedChildren: unknown[] | undefined
  if (Array.isArray(nodeObj.children)) {
    normalizedChildren = nodeObj.children.map(normalizeLinkNodes)
  }

  if (nodeObj.type === 'link' || nodeObj.type === 'autolink') {
    let existingUrl: string | undefined

    if (typeof nodeObj.url === 'string' && nodeObj.url) {
      existingUrl = nodeObj.url
    } else if (typeof nodeObj.href === 'string' && nodeObj.href) {
      existingUrl = nodeObj.href
    } else if (typeof nodeObj.link === 'string' && nodeObj.link) {
      existingUrl = nodeObj.link
    }

    if (!existingUrl && typeof nodeObj.fields === 'object' && nodeObj.fields !== null) {
      const fields = nodeObj.fields as Record<string, unknown>
      if (typeof fields.url === 'string' && fields.url) {
        existingUrl = fields.url
      } else if (typeof fields.href === 'string' && fields.href) {
        existingUrl = fields.href
      }
    }

    if (!existingUrl) {
      for (const [, value] of Object.entries(nodeObj)) {
        if (
          typeof value === 'string' &&
          value &&
          (value.startsWith('http://') ||
            value.startsWith('https://') ||
            value.startsWith('mailto:'))
        ) {
          existingUrl = value
          break
        }
      }
    }

    const fields: Record<string, unknown> =
      typeof nodeObj.fields === 'object' && nodeObj.fields !== null
        ? { ...(nodeObj.fields as Record<string, unknown>) }
        : {}

    if (existingUrl) {
      fields.url = existingUrl
    }

    fields.newTab = true

    return {
      ...nodeObj,
      url: existingUrl || nodeObj.url,
      fields,
      children: normalizedChildren !== undefined ? normalizedChildren : nodeObj.children,
    }
  }

  if (normalizedChildren !== undefined) {
    return {
      ...nodeObj,
      children: normalizedChildren,
    }
  }

  return nodeObj
}

export function normalizeLexicalContent(content: unknown): unknown {
  if (!isLexicalContent(content)) {
    return content
  }

  const contentObj = content as Record<string, unknown>
  const root = contentObj.root as Record<string, unknown>

  const normalizedChildren = Array.isArray(root.children)
    ? root.children.map(normalizeLinkNodes)
    : root.children

  return {
    ...contentObj,
    root: {
      ...root,
      children: normalizedChildren,
    },
  }
}

export function ensureValidLexicalContent(content: unknown): unknown {
  if (!isLexicalContent(content)) {
    return content
  }

  const contentObj = content as Record<string, unknown>
  const root = contentObj.root as Record<string, unknown>
  const children = root.children as unknown[]

  if (!Array.isArray(children) || children.length === 0) {
    return {
      ...contentObj,
      root: {
        ...root,
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
      },
    }
  }

  return content
}

function isParagraphEmpty(paragraphNode: Record<string, unknown>): boolean {
  if (!paragraphNode || typeof paragraphNode !== 'object') {
    return true
  }

  const children = paragraphNode.children as unknown[]

  if (!Array.isArray(children) || children.length === 0) {
    return true
  }

  let hasNonEmptyContent = false

  for (const child of children) {
    const childObj = child as Record<string, unknown>

    if (childObj.type === 'text') {
      const text = typeof childObj.text === 'string' ? childObj.text : ''
      if (text.trim()) {
        hasNonEmptyContent = true
        break
      }
    } else if (childObj.type === 'link' || childObj.type === 'autolink') {
      const linkUrl =
        typeof childObj.url === 'string'
          ? childObj.url
          : typeof (childObj.fields as Record<string, unknown>)?.url === 'string'
            ? ((childObj.fields as Record<string, unknown>).url as string)
            : null

      if (linkUrl && linkUrl.trim()) {
        hasNonEmptyContent = true
        break
      }

      const linkChildren = childObj.children as unknown[]
      if (Array.isArray(linkChildren)) {
        for (const linkChild of linkChildren) {
          const linkChildObj = linkChild as Record<string, unknown>
          if (linkChildObj.type === 'text') {
            const linkText = typeof linkChildObj.text === 'string' ? linkChildObj.text : ''
            if (linkText.trim()) {
              hasNonEmptyContent = true
              break
            }
          }
        }
      }
      if (hasNonEmptyContent) break
    } else if (childObj.type && childObj.type !== 'text') {
      hasNonEmptyContent = true
      break
    }
  }

  return !hasNonEmptyContent
}

function removeEmptyParagraphsRecursive(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return node
  }

  const nodeObj = node as Record<string, unknown>

  if (nodeObj.type === 'paragraph') {
    if (isParagraphEmpty(nodeObj)) {
      return null
    }
  }

  if (Array.isArray(nodeObj.children)) {
    const cleanedChildren = nodeObj.children
      .map(removeEmptyParagraphsRecursive)
      .filter((child) => child !== null)

    if (nodeObj.type === 'paragraph' && cleanedChildren.length === 0) {
      return null
    }

    return {
      ...nodeObj,
      children: cleanedChildren,
    }
  }

  return nodeObj
}

export function removeTrailingEmptyParagraphs(content: unknown): unknown {
  if (!isLexicalContent(content)) {
    return content
  }

  const contentObj = content as Record<string, unknown>
  const root = contentObj.root as Record<string, unknown>
  const children = root.children as unknown[]

  if (!Array.isArray(children)) {
    return content
  }

  const normalizedChildren = children.map(normalizeLinkNodes)

  const cleanedChildren = normalizedChildren
    .map(removeEmptyParagraphsRecursive)
    .filter((child) => child !== null) as unknown[]

  const finalChildren: unknown[] = []
  for (let i = cleanedChildren.length - 1; i >= 0; i--) {
    const child = cleanedChildren[i] as Record<string, unknown>
    if (child.type === 'paragraph' && isParagraphEmpty(child)) {
      continue
    }
    finalChildren.unshift(...cleanedChildren.slice(0, i + 1))
    break
  }

  if (finalChildren.length === 0) {
    return {
      ...contentObj,
      root: {
        ...root,
        children: cleanedChildren.length > 0 ? [cleanedChildren[0]] : cleanedChildren,
      },
    }
  }

  return {
    ...contentObj,
    root: {
      ...root,
      children: finalChildren,
    },
  }
}
