'use client'

import { useState } from 'react'
import { EditorState } from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $isParagraphNode,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $isTextNode,
} from 'lexical'
import { useCallback, useEffect } from 'react'
import { Button, Icon } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn/ui/dialog'
import { Input } from '@/components/shadcn/ui/input'
import { Label } from '@/components/shadcn/ui/label'

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    hashtag: 'editor-text-hashtag',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
  code: 'editor-code',
  codeHighlight: {
    atrule: 'editor-tokenAttr',
    attr: 'editor-tokenAttr',
    boolean: 'editor-tokenProperty',
    builtin: 'editor-tokenSelector',
    cdata: 'editor-tokenComment',
    char: 'editor-tokenSelector',
    class: 'editor-tokenFunction',
    'class-name': 'editor-tokenFunction',
    comment: 'editor-tokenComment',
    constant: 'editor-tokenProperty',
    deleted: 'editor-tokenProperty',
    doctype: 'editor-tokenComment',
    entity: 'editor-tokenOperator',
    function: 'editor-tokenFunction',
    important: 'editor-tokenVariable',
    inserted: 'editor-tokenSelector',
    keyword: 'editor-tokenAttr',
    namespace: 'editor-tokenVariable',
    number: 'editor-tokenProperty',
    operator: 'editor-tokenOperator',
    prolog: 'editor-tokenComment',
    property: 'editor-tokenProperty',
    punctuation: 'editor-tokenPunctuation',
    regex: 'editor-tokenVariable',
    selector: 'editor-tokenSelector',
    string: 'editor-tokenSelector',
    symbol: 'editor-tokenProperty',
    tag: 'editor-tokenProperty',
    url: 'editor-tokenOperator',
    variable: 'editor-tokenVariable',
  },
}

function onError(error: Error) {
  console.error(error)
}

interface LexicalEditorProps {
  value?: unknown
  onChange: (value: unknown) => void
  placeholder?: string
  disabled?: boolean
}

// Link insertion modal component
function LinkModal({
  isOpen,
  onClose,
  onInsert,
  initialUrl,
  initialText,
}: {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, text: string) => void
  initialUrl?: string
  initialText?: string
}) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || '')
      setText(initialText || '')
    }
  }, [isOpen, initialUrl, initialText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onInsert(url.trim(), text.trim() || url.trim())
      setUrl('')
      setText('')
      onClose()
    }
  }

  const isEditing = Boolean(initialUrl)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit link' : 'Insert link'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Link text (optional)</Label>
            <Input
              id="text"
              placeholder="Link text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSubmit(e)
              }}
            >
              {isEditing ? 'Update link' : 'Insert link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Toolbar component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState<string | undefined>()
  const [linkText, setLinkText] = useState<string | undefined>()

  const handleLinkClick = useCallback((url: string, text: string) => {
    setLinkUrl(url)
    setLinkText(text)
    setIsLinkModalOpen(true)
  }, [])

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))

      const node = selection.anchor.getNode()
      const parent = node.getParent()
      const isInLink = $isLinkNode(parent) || $isLinkNode(node)
      setIsLink(isInLink)

      if (isInLink) {
        const linkNode = $isLinkNode(parent) ? parent : $isLinkNode(node) ? node : null
        if (linkNode) {
          const url = linkNode.getURL()
          setLinkUrl(url)
          setLinkText(linkNode.getTextContent())
        }
      } else {
        setLinkUrl(undefined)
        setLinkText(undefined)
      }
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        1,
      ),
    )
  }, [editor, updateToolbar])

  const insertLink = useCallback(
    (url: string, text: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }

        const selectedText = selection.getTextContent()
        const isInLink = (() => {
          const node = selection.anchor.getNode()
          const parent = node.getParent()
          return $isLinkNode(parent) || $isLinkNode(node)
        })()

        if (isInLink) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
          const newSelection = $getSelection()
          if ($isRangeSelection(newSelection) && url) {
            if (text && text !== url && text !== selectedText) {
              const anchorOffset = newSelection.anchor.offset
              newSelection.insertText(text)
              const updatedSelection = $getSelection()
              if ($isRangeSelection(updatedSelection)) {
                const anchorNode = updatedSelection.anchor.getNode()
                if ($isTextNode(anchorNode)) {
                  updatedSelection.setTextNodeRange(
                    anchorNode,
                    anchorOffset,
                    anchorNode,
                    anchorOffset + text.length,
                  )
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
                }
              }
            } else {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
            }
          }
        } else if (url) {
          if (selectedText) {
            if (text && text !== selectedText) {
              const anchorOffset = selection.anchor.offset
              selection.insertText(text)
              const newSelection = $getSelection()
              if ($isRangeSelection(newSelection)) {
                const anchorNode = newSelection.anchor.getNode()
                if ($isTextNode(anchorNode)) {
                  newSelection.setTextNodeRange(
                    anchorNode,
                    anchorOffset,
                    anchorNode,
                    anchorOffset + text.length,
                  )
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
                }
              }
            } else {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
            }
          } else if (text && text !== url) {
            const anchorOffset = selection.anchor.offset
            selection.insertText(text)
            const newSelection = $getSelection()
            if ($isRangeSelection(newSelection)) {
              const anchorNode = newSelection.anchor.getNode()
              if ($isTextNode(anchorNode)) {
                newSelection.setTextNodeRange(
                  anchorNode,
                  anchorOffset,
                  anchorNode,
                  anchorOffset + text.length,
                )
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
              }
            }
          } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
          }
        }
      })
    },
    [editor],
  )

  const handleLinkButtonClick = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const selectedText = selection.getTextContent()
        const node = selection.anchor.getNode()
        const parent = node.getParent()
        const isInLink = $isLinkNode(parent) || $isLinkNode(node)

        if (isInLink) {
          const linkNode = $isLinkNode(parent) ? parent : $isLinkNode(node) ? node : null
          if (linkNode) {
            const url = linkNode.getURL()
            const text = linkNode.getTextContent()
            setLinkUrl(url)
            setLinkText(text)
            setIsLinkModalOpen(true)
          }
        } else {
          setLinkUrl(undefined)
          setLinkText(selectedText || undefined)
          setIsLinkModalOpen(true)
        }
      } else {
        setLinkUrl(undefined)
        setLinkText(undefined)
        setIsLinkModalOpen(true)
      }
    })
  }, [editor])

  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50 px-2 py-1">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            className={`${isBold ? 'bg-gray-200' : ''}`}
          >
            <Icon name="bold" size="sm" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            className={`${isItalic ? 'bg-gray-200' : ''}`}
          >
            <Icon name="italic" size="sm" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleLinkButtonClick}
            className={`${isLink ? 'bg-gray-200' : ''}`}
          >
            <Icon name="link" size="sm" />
          </Button>
        </div>
      </div>
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false)
          setLinkUrl(undefined)
          setLinkText(undefined)
        }}
        onInsert={insertLink}
        initialUrl={linkUrl}
        initialText={linkText}
      />
      <LinkClickHandlerPlugin onLinkClick={handleLinkClick} />
    </>
  )
}

// Plugin to handle link clicks and open edit dialog
function LinkClickHandlerPlugin({
  onLinkClick,
}: {
  onLinkClick: (url: string, text: string) => void
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.href) {
        event.preventDefault()
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode()
            const parent = node.getParent()
            const linkNode = $isLinkNode(parent) ? parent : $isLinkNode(node) ? node : null
            if (linkNode) {
              const url = linkNode.getURL()
              const text = linkNode.getTextContent()
              onLinkClick(url, text)
            } else {
              const range = document.createRange()
              range.selectNodeContents(anchor)
              const newSelection = window.getSelection()
              if (newSelection) {
                newSelection.removeAllRanges()
                newSelection.addRange(range)
              }
              setTimeout(() => {
                editor.update(() => {
                  const updatedSelection = $getSelection()
                  if ($isRangeSelection(updatedSelection)) {
                    const updatedNode = updatedSelection.anchor.getNode()
                    const updatedParent = updatedNode.getParent()
                    const updatedLinkNode = $isLinkNode(updatedParent)
                      ? updatedParent
                      : $isLinkNode(updatedNode)
                        ? updatedNode
                        : null
                    if (updatedLinkNode) {
                      const url = updatedLinkNode.getURL()
                      const text = updatedLinkNode.getTextContent()
                      onLinkClick(url, text)
                    }
                  }
                })
              }, 0)
            }
          }
        })
      }
    }

    const rootElement = editor.getRootElement()
    if (rootElement) {
      rootElement.addEventListener('click', handleClick, true)
      return () => {
        rootElement.removeEventListener('click', handleClick, true)
      }
    }
  }, [editor, onLinkClick])

  return null
}

// Plugin to limit consecutive empty paragraphs
function LimitLineBreaksPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }

        const anchorNode = selection.anchor.getNode()

        // Check if we're in an empty paragraph
        if ($isParagraphNode(anchorNode) && anchorNode.getTextContent().trim() === '') {
          // Check if the previous sibling is also an empty paragraph
          const previousSibling = anchorNode.getPreviousSibling()
          if (
            previousSibling &&
            $isParagraphNode(previousSibling) &&
            previousSibling.getTextContent().trim() === ''
          ) {
            // Prevent the enter key from creating another empty paragraph
            event?.preventDefault()
            return true
          }
        }

        return false
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}

export function LexicalEditor({ value, onChange, placeholder, disabled }: LexicalEditorProps) {
  // Create a default empty state if no value is provided
  const defaultState = {
    root: {
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
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }

  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editorState:
      value && typeof value === 'object' && value !== null && 'root' in value
        ? JSON.stringify(value)
        : JSON.stringify(defaultState),
  }

  const handleChange = (editorState: EditorState) => {
    const serializedState = editorState.toJSON()
    onChange(serializedState)
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-0 flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="max-h-96 min-h-32 w-full resize-none overflow-y-auto p-3 !text-base outline-none"
                style={{ minHeight: '128px', maxHeight: '256px' }}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute top-3 left-3 text-base font-normal text-gray-400">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={disabled ? () => {} : handleChange} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <AutoLinkPlugin
            matchers={[
              (text) => {
                // Match URLs starting with http:// or https://
                const urlRegex = /(https?:\/\/[^\s]+)/
                const match = text.match(urlRegex)
                if (match && match.index !== undefined) {
                  return {
                    index: match.index,
                    length: match[0].length,
                    text: match[0],
                    url: match[0],
                  }
                }
                return null
              },
              (text) => {
                // Match URLs starting with www.
                const wwwRegex = /(www\.[^\s]+)/
                const match = text.match(wwwRegex)
                if (match && match.index !== undefined) {
                  return {
                    index: match.index,
                    length: match[0].length,
                    text: match[0],
                    url: `https://${match[0]}`,
                  }
                }
                return null
              },
              (text) => {
                // Match email addresses
                const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
                const match = text.match(emailRegex)
                if (match && match.index !== undefined) {
                  return {
                    index: match.index,
                    length: match[0].length,
                    text: match[0],
                    url: `mailto:${match[0]}`,
                  }
                }
                return null
              },
            ]}
          />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <LimitLineBreaksPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}
