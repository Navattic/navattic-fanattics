'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'

// Get ALL available timezones from the browser
const getAllTimezones = () => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return []
  }

  // This gets all timezones that the browser supports
  const timezones = Intl.supportedValuesOf('timeZone')

  // Create a comprehensive list with common names and search terms
  const timezoneData = timezones.map((tz) => {
    // Try to get a friendly name
    let friendlyName = tz
    let searchTerms = tz.toLowerCase()

    // Add common city/country names for better search
    const cityMappings: Record<string, string> = {
      'America/New_York': 'Eastern Time (EST/EDT) | New York',
      'America/Chicago': 'Central Time (CST/CDT) | Chicago',
      'America/Denver': 'Mountain Time (MST/MDT) | Denver',
      'America/Los_Angeles': 'Pacific Time (PST/PDT) | Los Angeles',
      'America/Toronto': 'Eastern Time (EST/EDT) | Toronto',
      'America/Vancouver': 'Pacific Time (PST/PDT) | Vancouver',
      'Europe/London': 'London Time (GMT/BST) | London',
      'Europe/Paris': 'Central European Time (CET/CEST) | Paris',
      'Europe/Berlin': 'Central European Time (CET/CEST) | Berlin',
      'Asia/Tokyo': 'Japan Standard Time (JST) | Tokyo',
      'Asia/Shanghai': 'China Standard Time (CST) | Shanghai',
      'Asia/Hong_Kong': 'Hong Kong Time (HKT) | Hong Kong',
      'Asia/Singapore': 'Singapore Time (SGT) | Singapore',
      'Asia/Kolkata': 'India Standard Time (IST) | New Delhi',
      'Australia/Sydney': 'Australian Eastern Time (AEST/AEDT) | Sydney',
      UTC: 'Coordinated Universal Time (UTC) | Greenwich',
    }

    if (cityMappings[tz]) {
      friendlyName = cityMappings[tz]
      searchTerms = `${tz.toLowerCase()} ${friendlyName.toLowerCase()}`
    } else {
      // Extract city name from timezone for better search
      const parts = tz.split('/')
      if (parts.length > 1) {
        const city = parts[parts.length - 1].replace(/_/g, ' ')
        searchTerms = `${tz.toLowerCase()} ${city.toLowerCase()}`
      }
    }

    return {
      value: tz,
      label: friendlyName,
      search: searchTerms,
    }
  })

  // Sort by region, then by city
  return timezoneData.sort((a, b) => {
    const aParts = a.value.split('/')
    const bParts = b.value.split('/')

    // UTC first
    if (a.value === 'UTC') return -1
    if (b.value === 'UTC') return 1

    // Then by region
    if (aParts[0] !== bParts[0]) {
      return aParts[0].localeCompare(bParts[0])
    }

    // Then by city
    return aParts[aParts.length - 1].localeCompare(bParts[bParts.length - 1])
  })
}

const TimezoneField: React.FC = () => {
  const { value, setValue, errorMessage } = useField<string>({ path: 'timezone' })
  const [inputValue, setInputValue] = useState(value || '')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<any[]>([])
  const [allTimezones, setAllTimezones] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Initialize timezones on client side only
  useEffect(() => {
    setIsClient(true)
    setAllTimezones(getAllTimezones())
  }, [])

  // Filter options based on input
  useEffect(() => {
    if (!isClient) return // Don't run until client-side

    if (!inputValue.trim()) {
      // Show most common timezones when empty
      const commonTimezones = allTimezones.filter((tz) =>
        [
          'UTC',
          'America/New_York',
          'America/Chicago',
          'America/Denver',
          'America/Los_Angeles',
          'Europe/London',
          'Europe/Paris',
          'Europe/Berlin',
          'Asia/Tokyo',
          'Asia/Shanghai',
          'Australia/Sydney',
        ].includes(tz.value),
      )
      setFilteredOptions(commonTimezones)
    } else {
      const filtered = allTimezones.filter(
        (option) =>
          option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.search.toLowerCase().includes(inputValue.toLowerCase()),
      )
      setFilteredOptions(filtered.slice(0, 20)) // Limit to 20 results for performance
    }
  }, [inputValue, allTimezones, isClient])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  // Handle option selection
  const handleOptionSelect = (option: any) => {
    setValue(option.value)
    setInputValue(option.label)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        return
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle focus
  const handleFocus = () => {
    setIsOpen(true)
  }

  // Validate timezone
  const validateTimezone = (tz: string) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  }

  // Handle input blur - validate and set value
  const handleBlur = () => {
    if (inputValue && validateTimezone(inputValue)) {
      setValue(inputValue)
    } else if (inputValue && !validateTimezone(inputValue)) {
      // Try to find a match
      const match = allTimezones.find(
        (option) => option.value === inputValue || option.label === inputValue,
      )
      if (match) {
        setValue(match.value)
        setInputValue(match.label)
      }
    }
  }

  return (
    <div className="field-type text">
      <label className="field-label">
        Timezone
        <span className="required">*</span>
      </label>
      <div className="field-description">
        User&apos;s timezone (IANA format, e.g., &apos;America/New_York&apos;,
        &apos;Europe/London&apos;, &apos;UTC&apos;)
      </div>

      <div className="timezone-field-container" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type to search timezones (e.g., 'eastern', 'london', 'tokyo')"
          className={`field-input ${errorMessage ? 'error' : ''}`}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: errorMessage ? '1px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />

        {isClient && isOpen && filteredOptions.length > 0 && (
          <ul
            ref={listRef}
            className="timezone-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              maxHeight: '300px', // Increased height for more options
              overflowY: 'auto',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {filteredOptions.map((option, index) => (
              <li
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: index === selectedIndex ? '#f3f4f6' : 'transparent',
                  borderBottom: index < filteredOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{option.label}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {option.value}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {errorMessage && (
        <div
          className="field-error"
          style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}
        >
          {errorMessage}
        </div>
      )}

      <div className="field-help" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        💡 Tip: Type city names, timezone abbreviations, or common terms. All{' '}
        {isClient ? allTimezones.length : '400+'} IANA timezones are supported.
      </div>
    </div>
  )
}

export default TimezoneField
