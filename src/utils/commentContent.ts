import { Comment } from '@/payload-types'

/**
 * Helper function to extract text from Lexical content recursively
 */
export function extractTextFromLexicalContent(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const nodeObj = node as Record<string, unknown>

  // If this is a text node, return its text
  if (nodeObj.type === 'text' && typeof nodeObj.text === 'string') {
    return nodeObj.text
  }

  // If this node has children, recursively extract text from them
  if (Array.isArray(nodeObj.children)) {
    return nodeObj.children.map(extractTextFromLexicalContent).join('')
  }

  return ''
}

/**
 * Detects if content is Lexical JSON format
 */
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

/**
 * Detects if content is plain string
 */
export function isStringContent(content: unknown): boolean {
  return typeof content === 'string'
}

/**
 * Gets the active content from a comment (richContent if exists, otherwise content)
 */
export function getCommentContent(comment: Comment): string | Comment['richContent'] {
  // Check if richContent exists and is not null/undefined
  if (comment.richContent != null) {
    return comment.richContent
  }
  // Fall back to content field (for backward compatibility)
  return comment.content || ''
}

/**
 * Converts plain text to Lexical format
 */
export function convertStringToLexical(text: string) {
  // Split text by newlines to preserve line breaks
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

/**
 * Extracts plain text from comment content (for emails, etc.)
 */
export function extractCommentText(comment: Comment): string {
  if (comment.richContent && isLexicalContent(comment.richContent)) {
    const richContentObj = comment.richContent as Record<string, unknown>
    return extractTextFromLexicalContent(richContentObj.root).trim()
  }
  // Fall back to content field
  return (comment.content as string) || ''
}
