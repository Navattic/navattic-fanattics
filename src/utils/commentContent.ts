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

/**
 * Removes trailing empty paragraphs from Lexical content
 */
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

  // Remove empty paragraphs from the end
  const filteredChildren = [...children]
  while (filteredChildren.length > 0) {
    const lastChild = filteredChildren[filteredChildren.length - 1] as Record<string, unknown>
    
    // Check if it's a paragraph
    if (lastChild.type === 'paragraph') {
      const paragraphChildren = lastChild.children as unknown[]
      if (Array.isArray(paragraphChildren)) {
        // Check if paragraph is empty (no text content)
        const hasText = paragraphChildren.some((child) => {
          const childObj = child as Record<string, unknown>
          return childObj.type === 'text' && typeof childObj.text === 'string' && childObj.text.trim() !== ''
        })
        
        if (!hasText) {
          // Remove this empty paragraph
          filteredChildren.pop()
          continue
        }
      }
    }
    
    // Stop if we hit a non-empty paragraph or non-paragraph element
    break
  }

  // Return cleaned content
  return {
    ...contentObj,
    root: {
      ...root,
      children: filteredChildren,
    },
  }
}
