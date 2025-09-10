'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/shadcn/ui/input'
import { Check, Search, X, ChevronDown } from 'lucide-react'
import { Button, Icon } from '@/components/ui'
import { cn } from '@/lib/utils'
import cities from 'cities.json' with { type: 'json' }

// Based on the actual cities.json structure from https://github.com/lutangar/cities.json
interface City {
  name: string
  lat: string
  lng: string
  country: string
  admin1: string
  admin2: string
}

interface LocationSelectorProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  state?: 'default' | 'error'
  placeholder?: string
}

// Mapping for country codes to full country names
const countryNames: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  IE: 'Ireland',
  PT: 'Portugal',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  SI: 'Slovenia',
  SK: 'Slovakia',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  IN: 'India',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  TH: 'Thailand',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  MA: 'Morocco',
  IL: 'Israel',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  TR: 'Turkey',
  RU: 'Russia',
  UA: 'Ukraine',
  BY: 'Belarus',
  KZ: 'Kazakhstan',
  UZ: 'Uzbekistan',
  NZ: 'New Zealand',
  FJ: 'Fiji',
  IS: 'Iceland',
  LU: 'Luxembourg',
  MT: 'Malta',
  CY: 'Cyprus',
  GR: 'Greece',
}

// Function to normalize text by removing accents and diacritics
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
}

export function LocationSelector({
  value,
  onChange,
  error,
  state = 'default',
  placeholder = 'Search city or country...',
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const filteredCities = useMemo(() => {
    if (!searchTerm) return (cities as City[]).slice(0, 50)

    const normalizedSearchTerm = normalizeText(searchTerm)
    return (cities as City[])
      .filter(
        (city) =>
          normalizeText(city.name).includes(normalizedSearchTerm) ||
          normalizeText(city.country).includes(normalizedSearchTerm) ||
          (countryNames[city.country] &&
            normalizeText(countryNames[city.country]).includes(normalizedSearchTerm)),
      )
      .slice(0, 50)
  }, [searchTerm])

  // Create a stable unique key that doesn't depend on array position
  const getCityKey = (city: City) =>
    `${city.name}-${city.country}-${city.admin1}-${city.lat}-${city.lng}`

  // Find selected city using the stable key
  const selectedCity = (cities as City[]).find((city) => getCityKey(city) === value)

  const getCountryName = (countryCode: string) => {
    return countryNames[countryCode] || countryCode
  }

  const formatLocation = (city: City) => {
    return `${city.name}, ${getCountryName(city.country)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsSearching(true)

    // If user is typing and there's a selected city, clear the selection
    if (selectedCity && newValue !== formatLocation(selectedCity)) {
      onChange('')
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
  }

  const handleCitySelect = (city: City) => {
    onChange(getCityKey(city))
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

  // Determine input styling based on state
  const getInputClassName = () => {
    const hasSelection = selectedCity && !isSearching

    return cn(
      'h-[36px] w-full text-base transition-colors',
      hasSelection
        ? 'text-gray-900 cursor-pointer font-medium' // Selected state - darker text, bold
        : 'text-gray-500', // Search/empty state - muted text
      isSearching || !selectedCity ? 'pl-10 pr-4' : 'pl-4 pr-10', // Icon positioning
      state === 'error' && 'border-destructive focus-visible:ring-destructive',
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Search icon - only show when searching or no selection */}
        {(isSearching || !selectedCity) && (
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}

        <Input
          placeholder={selectedCity && !isSearching ? '' : placeholder}
          value={getInputDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={getInputClassName()}
          readOnly={selectedCity && !isSearching}
        />

        {/* Dropdown indicator - show when selected and not searching */}
        {selectedCity && !isSearching && (
          <Icon
            name="chevrons-up-down"
            className="absolute top-1/2 right-3 -translate-y-1/2 opacity-50"
          />
        )}
      </div>

      {/* Clear selection button - consistent with CompanySelector pattern */}
      {selectedCity && !isSearching && (
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive h-6 px-2"
          >
            <Icon name="x" className="size-4" />
            Clear selection
          </Button>
        </div>
      )}

      {open && (isSearching || !selectedCity) && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown - Fixed width to prevent viewport overflow */}
          <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-[400px] max-w-[calc(100vw-2rem)] rounded-md border shadow-md">
            <div className="max-h-[200px] overflow-auto p-1">
              {filteredCities.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  No location found.
                </div>
              ) : (
                filteredCities.map((city, index) => (
                  <div
                    key={getCityKey(city)}
                    onClick={() => handleCitySelect(city)}
                    className={cn(
                      'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground',
                      value === getCityKey(city) && 'bg-accent text-accent-foreground',
                    )}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 flex-shrink-0',
                        value === getCityKey(city) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{city.name}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {getCountryName(city.country)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
