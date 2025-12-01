'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

/**
 * A hook for managing input field state with debounced server updates.
 * This hook implements a focused sync pattern:
 * 1. Initialize with server value on mount
 * 2. Immediately update local UI state when user types
 * 3. Debounce expensive operations like API calls
 * 4. Only sync with server when input is unfocused (blur event)
 *
 * This pattern prevents UI flickering during active editing while still
 * ensuring syncing with server data when appropriate.
 *
 * @param serverValue The value from the server
 * @param onSave Function to call when saving changes to the server
 * @param options Configuration options
 * @returns Object with value, handlers, and a `getInputProps` function that returns props to spread onto an input component
 */
export function useDebounceInput<T>(
  serverValue: T,
  onSave: (value: T) => Promise<void> | void,
  options: {
    /** Debounce time in milliseconds */
    debounceMs?: number
    /** Callback when editing state changes */
    onEditingChange?: (isEditing: boolean) => void
    /** Callback for immediate value changes */
    onChange?: (value: T) => void
    /** Whether to sync with server value when input loses focus */
    syncOnBlur?: boolean
  } = {},
) {
  const { debounceMs = 500, onEditingChange, onChange, syncOnBlur = true } = options

  // Track the displayed value, focus state, and pending save state
  const [value, setValue] = useState<T>(serverValue)
  const [isPendingSave, setIsPendingSave] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Update local state from server value when appropriate
  useEffect(() => {
    // Only sync with server when:
    // 1. Not actively editing (not focused)
    // 2. syncOnBlur is enabled
    // 3. Not waiting for a save to complete
    if (!isFocused && syncOnBlur && !isPendingSave) {
      setValue(serverValue)
    }
  }, [serverValue, isFocused, syncOnBlur, isPendingSave])

  // Initial state is set from serverValue via useState initializer

  // Notify about editing state changes
  useEffect(() => {
    onEditingChange?.(isPendingSave)
  }, [isPendingSave, onEditingChange])

  // Handler for immediate UI updates
  const handleChange = useCallback(
    (newValue: T) => {
      setValue(newValue)
      setIsPendingSave(true)
      onChange?.(newValue)
    },
    [onChange],
  )

  // Debounced handler for server updates
  const debouncedSave = useDebouncedCallback(async (newValue: T) => {
    try {
      await onSave(newValue)
    } catch (error) {
      // If saving fails, we might want to handle that
      console.error('Error saving value:', error)
    } finally {
      setIsPendingSave(false)
    }
  }, debounceMs)

  // Clean up debounced callbacks on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  return {
    /** Current displayed value (may be ahead of server value during editing) */
    value,
    /** Callback for immediate value changes */
    onValueChange: handleChange,
    /** Debounced callback for expensive operations like API calls */
    onChangeDebounced: debouncedSave,
    /** Whether a server update is pending */
    isPendingSave,
    /** Handle focus event */
    onFocus: () => setIsFocused(true),
    /** Handle blur event */
    onBlur: () => setIsFocused(false),

    /** Ready-to-use props that can be spread directly onto an input component */
    inputProps: {
      value,
      onValueChange: handleChange,
      onChangeDebounced: debouncedSave,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    },
  }
}
