'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/shadcn/ui/input'
import { Button, Icon } from '@/components/ui'
import { cn } from '@/lib/utils'

// API Ninjas City API response structure
interface City {
  name: string
  latitude: number
  longitude: number
  country: string
  population: number
  region?: string
  is_capital: boolean
}

interface LocationSelectorProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  state?: 'default' | 'error'
  placeholder?: string
}

// Debounce hook for API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function LocationSelector({
  value,
  onChange,
  state = 'default',
  placeholder = 'Search city...',
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch cities from our API route
  const fetchCities = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCities([])
      return
    }

    setIsLoading(true)
    setApiError(null)

    try {
      const response = await fetch(`/api/cities/search?name=${encodeURIComponent(query)}&limit=10`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API request failed: ${response.status}`)
      }

      const data = await response.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
      setApiError('Failed to fetch cities. Please try again.')
      setCities([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a stable unique key for cities
  const getCityKey = (city: City) => `${city.name}, ${city.country}`

  // Handle external value changes (e.g., from form restoration)
  useEffect(() => {
    if (value && !selectedCity) {
      // If we have a value but no selected city, try to parse it
      const [name, country] = value.split(', ')
      if (name && country) {
        // Create a temporary city object for display
        const tempCity: City = {
          name: name.trim(),
          country: country.trim(),
          latitude: 0,
          longitude: 0,
          population: 0,
          is_capital: false,
        }
        setSelectedCity(tempCity)
      }
    } else if (!value && selectedCity) {
      // If value is cleared, clear selected city
      setSelectedCity(null)
    }
  }, [value, selectedCity])

  // Fetch cities when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm && open) {
      fetchCities(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, open, fetchCities])

  const formatLocation = (city: City) => {
    return `${city.name}, ${city.country}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsSearching(true)

    // If user is typing and there's a selected city, clear the selection
    if (selectedCity && newValue !== formatLocation(selectedCity)) {
      onChange('')
      setSelectedCity(null)
    }

    if (!open) setOpen(true)
  }

  const handleInputFocus = () => {
    if (selectedCity) {
      // If there's a selection, start fresh search
      setSearchTerm('')
      setIsSearching(true)
    } else {
      setIsSearching(true)
    }
    setOpen(true)
  }

  const handleInputBlur = () => {
    // Small delay to allow for dropdown clicks
    setTimeout(() => {
      if (!selectedCity) {
        setSearchTerm('')
      }
      setIsSearching(false)
      setOpen(false)
    }, 150)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setIsSearching(false)
    setOpen(false)
    setCities([])
    setApiError(null)
    setSelectedCity(null)
  }

  const handleCitySelect = (city: City) => {
    onChange(getCityKey(city))
    setSelectedCity(city)
    setOpen(false)
    setSearchTerm('')
    setIsSearching(false)
  }

  // Determine what to show in the input
  const getInputDisplayValue = () => {
    if (isSearching) return searchTerm
    if (selectedCity) return formatLocation(selectedCity)
    return ''
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Search icon - only show when searching or no selection */}
        {(isSearching || !selectedCity) && (
          <Icon
            name="search"
            size="sm"
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          />
        )}

        <Input
          placeholder={selectedCity && !isSearching ? '' : placeholder}
          value={getInputDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={cn(
            'h-[36px] w-full text-base transition-colors',
            selectedCity && !isSearching
              ? 'cursor-pointer font-medium text-gray-900' // Selected state - darker text, bold
              : 'text-gray-500', // Search/empty state - muted text
            isSearching || !selectedCity ? 'pr-4 pl-9' : 'pr-10 pl-4', // Icon positioning
            state === 'error' && 'border-destructive focus-visible:ring-destructive',
          )}
          readOnly={!!selectedCity && !isSearching}
        />

        {/* Loading spinner or dropdown indicator */}
        {selectedCity && !isSearching ? (
          <Icon
            name="chevrons-up-down"
            className="absolute top-1/2 right-3 -translate-y-1/2 opacity-50"
          />
        ) : isLoading ? (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Icon name="spinner" />
          </div>
        ) : null}
      </div>

      {/* Clear selection button */}
      {selectedCity && !isSearching && (
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            // className="text-muted-foreground hover:text-destructive"
          >
            <Icon name="x" className="size-4" />
            Clear selection
          </Button>
        </div>
      )}

      {open && isSearching && searchTerm && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-[400px] max-w-[calc(100vw-2rem)] rounded-lg border shadow-md min-h-[36px]">
            <div className="max-h-[200px] overflow-auto p-1">
              {isLoading ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-1.5 text-sm">
                  <Icon name="spinner" />
                  Searching cities...
                </div>
              ) : apiError ? (
                <div className="text-destructive py-1.5 text-center text-sm">{apiError}</div>
              ) : cities.length === 0 && debouncedSearchTerm && !isLoading ? (
                <div className="text-muted-foreground py-1.5 text-center text-sm">
                  No cities found. Try a different search term.
                </div>
              ) : cities.length > 0 ? (
                cities.map((city) => (
                  <div
                    key={getCityKey(city)}
                    onClick={() => handleCitySelect(city)}
                    className={cn(
                      'relative flex cursor-pointer items-center rounded-md py-1.5 text-sm outline-none select-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground',
                      value === getCityKey(city) && 'bg-accent text-accent-foreground',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col px-4">
                      <span className="truncate font-medium">
                        {city.name}, {city.country}
                      </span>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
