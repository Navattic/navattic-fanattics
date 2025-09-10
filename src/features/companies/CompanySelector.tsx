'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, ChevronsUpDown, PlusCircle, X, Upload, AlertTriangle } from 'lucide-react'
import { Button, Description, Icon, Modal, FieldSet } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Company } from '@/payload-types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/shadcn/ui/command'
import { Input } from '@/components/shadcn/ui/input'
import { Label } from '@/components/shadcn/ui/label'
import { FormControl, FormField, FormMessage } from '@/components/shadcn/ui/form'
import { useFormContext } from 'react-hook-form'
import { CompanyLogo as CompanyLogoComponent } from './CompanyLogo'

type CompanySelectorProps = {
  userEmail: string
  name: string
  label: string
  description?: string
}

type DuplicateCompany = {
  id: number
  name: string
  website?: string | null
  matchType: 'name' | 'website' | 'both'
}

// Move the modal content component outside to prevent re-renders
const NewCompanyModalContent = ({
  newCompanyName,
  setNewCompanyName,
  newCompanyWebsite,
  setNewCompanyWebsite,
  newCompanyLogo,
  isFetchingFavicon,
  isProcessingWebsite,
  duplicateCompanies,
  showDuplicateWarning,
  companies,
  suggestedCompanies,
  handleSelectCompany,
  resetNewCompanyForm,
  getLogoUrl,
  handleFileUpload,
  handleLogoRemove,
  fileInputRef,
  logoError,
  uploadedLogoFile,
}: {
  newCompanyName: string
  setNewCompanyName: (name: string) => void
  newCompanyWebsite: string
  setNewCompanyWebsite: (website: string) => void
  newCompanyLogo: string | null
  isFetchingFavicon: boolean
  isProcessingWebsite: boolean
  duplicateCompanies: DuplicateCompany[]
  showDuplicateWarning: boolean
  companies: Company[]
  suggestedCompanies: Company[]
  handleSelectCompany: (company: Company) => void
  resetNewCompanyForm: () => void
  getLogoUrl: (logoSrc: Company['logoSrc']) => string | null
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleLogoRemove: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  logoError: string | null
  uploadedLogoFile: File | null
}) => (
  <>
    {/* Hidden file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
      onChange={handleFileUpload}
      className="sr-only"
    />

    <div className="space-y-4">
      {/* Matching companies count and dropdown */}
      {showDuplicateWarning && duplicateCompanies.length > 0 && (
        <div className="space-y-3">
          {/* Dropdown with existing companies */}
          <div className="rounded-lg border border-gray-200 bg-blue-50 p-3">
            <Description
              title={`${duplicateCompanies.length} matching${' '}
                ${duplicateCompanies.length === 1 ? 'company' : 'companies'} found`}
              description="Use existing company data (suggested):"
            />
            <div className="mt-3 space-y-2">
              {duplicateCompanies.map((duplicate) => {
                const company =
                  companies.find((c) => c.id === duplicate.id) ||
                  suggestedCompanies.find((c) => c.id === duplicate.id)

                return (
                  <button
                    key={duplicate.id}
                    onClick={() => {
                      if (company) {
                        handleSelectCompany(company)
                        resetNewCompanyForm()
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 pl-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      <CompanyLogoComponent
                        src={company ? getLogoUrl(company.logoSrc) : null}
                        alt={duplicate.name}
                        className="h-6 w-6"
                      />
                    </div>

                    {/* Company Details */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">{duplicate.name}</div>
                      {duplicate.website && (
                        <div className="text-xs text-gray-500">{duplicate.website}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Company Name */}
      <div className="space-y-2">
        <Label className="block" htmlFor="new-company-name">
          Company name
        </Label>
        <Input
          id="new-company-name"
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          placeholder="e.g. Acme Inc."
          className="w-full"
        />
      </div>

      {/* Company Website */}
      <div className="space-y-2">
        <Label htmlFor="new-company-website" className="flex items-center gap-1">
          Company website
          {isProcessingWebsite && <Icon name="spinner" size="sm" className="animate-spin" />}
        </Label>
        <Input
          id="new-company-website"
          value={newCompanyWebsite}
          onChange={(e) => setNewCompanyWebsite(e.target.value)}
          placeholder="e.g. https://example.com"
          className="w-full"
          required
        />
      </div>

      {/* Company Logo - Only show after website is entered */}
      {newCompanyWebsite && (
        <div className="space-y-2">
          <Label>Company logo</Label>

          {isFetchingFavicon && (
            <div className="flex items-center justify-center py-4">
              <Icon name="spinner" className="text-muted-foreground h-4 w-4 animate-spin" />
              <span className="text-muted-foreground ml-2 text-sm">Fetching logo...</span>
            </div>
          )}

          {!isFetchingFavicon && (
            <>
              {newCompanyLogo ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-lg border border-gray-200">
                    <CompanyLogoComponent
                      src={newCompanyLogo}
                      alt="Company logo"
                      className="h-7 w-7"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoRemove}
                      className="h-7 text-gray-500"
                    >
                      <Icon name="x" className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Only show upload option if no favicon found or manually removed */
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload logo
                  </Button>
                  <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <Icon name="info" size="sm" className="mt-0.5 flex-shrink-0" />
                    <span>PNG, JPG, JPEG, SVG (max 5MB)</span>
                  </div>
                </div>
              )}

              {logoError && <p className="text-sm text-red-600">{logoError}</p>}
            </>
          )}
        </div>
      )}
    </div>
  </>
)

export function CompanySelector({ userEmail, name, label, description }: CompanySelectorProps) {
  const form = useFormContext()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [suggestedCompanies, setSuggestedCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('')
  const [newCompanyLogo, setNewCompanyLogo] = useState<string | null>(null)
  const [uploadedLogoFile, setUploadedLogoFile] = useState<File | null>(null)
  const [isLogoManuallyRemoved, setIsLogoManuallyRemoved] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isFetchingFavicon, setIsFetchingFavicon] = useState(false)
  const [isProcessingWebsite, setIsProcessingWebsite] = useState(false)
  const [duplicateCompanies, setDuplicateCompanies] = useState<DuplicateCompany[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const websiteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Extract domain from email
  const getEmailDomain = useCallback((email: string) => {
    try {
      const domain = email.split('@')[1]?.toLowerCase()
      return domain || null
    } catch {
      return null
    }
  }, [])

  // Get suggested company name from email domain
  const getSuggestedCompanyName = useCallback((domain: string) => {
    // Remove common TLDs and convert to title case
    const baseName = domain
      .replace(/\.(com|org|net|edu|gov|co\.uk|co|io|ai|tech)$/i, '')
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    return baseName
  }, [])

  // Get website URL from domain
  const getWebsiteFromDomain = useCallback((domain: string) => {
    return `https://${domain}`
  }, [])

  const emailDomain = getEmailDomain(userEmail)

  // Load initial company data if form has a company value
  useEffect(() => {
    const companyId = form.getValues(name)
    if (companyId && !selectedCompany) {
      const fetchCompanyData = async () => {
        try {
          const response = await fetch(`/api/companies/${companyId}`)
          if (response.ok) {
            const company = await response.json()
            setSelectedCompany(company)
          }
        } catch (error) {
          console.error('[CompanySelector] Error fetching initial company data:', error)
        }
      }
      fetchCompanyData()
    }
  }, [form, name, selectedCompany])

  // Fetch suggested companies based on email domain
  useEffect(() => {
    if (emailDomain && open) {
      const fetchSuggestedCompanies = async () => {
        try {
          const response = await fetch(
            `/api/companies/suggestions?domain=${encodeURIComponent(emailDomain)}`,
          )
          if (response.ok) {
            const { companies: suggested } = await response.json()
            setSuggestedCompanies(suggested || [])
          }
        } catch (error) {
          console.error('[CompanySelector] Error fetching suggested companies:', error)
        }
      }
      fetchSuggestedCompanies()
    }
  }, [emailDomain, open])

  // Fetch companies when search query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!open) return

    const fetchCompanies = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/companies?query=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setCompanies(data.docs || [])
      } catch (error) {
        console.error('[CompanySelector] Error fetching companies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (searchQuery) {
      searchTimeoutRef.current = setTimeout(fetchCompanies, 300)
    } else {
      fetchCompanies()
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, open])

  // Generate Google Favicon URL for a domain
  const generateFaviconUrl = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  }

  // Extract domain from URL
  const extractDomain = (url: string) => {
    try {
      // Handle URLs that might not have protocol
      let processedUrl = url.trim()

      // If URL doesn't start with http/https, add https://
      if (!processedUrl.match(/^https?:\/\//)) {
        processedUrl = `https://${processedUrl}`
      }

      const urlObj = new URL(processedUrl)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return null
    }
  }

  // Check for duplicate companies
  const checkForDuplicates = async (name: string, website?: string) => {
    try {
      const response = await fetch('/api/companies/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), website: website?.trim() }),
      })

      if (response.ok) {
        const { duplicates } = await response.json()
        setDuplicateCompanies(duplicates || [])
        setShowDuplicateWarning(duplicates && duplicates.length > 0)
      }
    } catch (error) {
      console.error('[CompanySelector] Error checking duplicates:', error)
    }
  }

  // Auto-populate company details from email domain
  const autoPopulateFromEmail = useCallback(() => {
    if (!emailDomain) return

    const suggestedName = getSuggestedCompanyName(emailDomain)
    const suggestedWebsite = getWebsiteFromDomain(emailDomain)

    setNewCompanyName(suggestedName)
    setNewCompanyWebsite(suggestedWebsite)
    setIsLogoManuallyRemoved(false)
    setUploadedLogoFile(null)

    // Auto-fetch favicon for the suggested domain
    setIsProcessingWebsite(true)
    const faviconUrl = generateFaviconUrl(emailDomain)

    const img = new Image()
    img.onload = () => {
      setNewCompanyLogo(faviconUrl)
      setIsFetchingFavicon(false)
      setIsProcessingWebsite(false)
    }
    img.onerror = () => {
      setNewCompanyLogo(null)
      setIsFetchingFavicon(false)
      setIsProcessingWebsite(false)
    }
    img.src = faviconUrl
  }, [emailDomain, getSuggestedCompanyName, getWebsiteFromDomain])

  // Debounced favicon fetching
  const debouncedFaviconFetch = useCallback((website: string) => {
    // Clear existing timeout
    if (websiteTimeoutRef.current) {
      clearTimeout(websiteTimeoutRef.current)
    }

    // Set processing state
    setIsProcessingWebsite(true)

    // Set new timeout for favicon fetching
    websiteTimeoutRef.current = setTimeout(() => {
      const domain = extractDomain(website)
      if (domain) {
        setIsFetchingFavicon(true)
        const faviconUrl = generateFaviconUrl(domain)

        // Test if the favicon loads successfully
        const img = new Image()
        img.onload = () => {
          setNewCompanyLogo(faviconUrl)
          setIsFetchingFavicon(false)
          setIsProcessingWebsite(false)
        }
        img.onerror = () => {
          setNewCompanyLogo(null)
          setIsFetchingFavicon(false)
          setIsProcessingWebsite(false)
        }
        img.src = faviconUrl
      } else {
        // Invalid domain, clear favicon loading state
        setIsFetchingFavicon(false)
        setNewCompanyLogo(null)
        setIsProcessingWebsite(false)
      }
    }, 750) // 750ms delay for website input
  }, [])

  // Debounced duplicate checking - fix the dependencies
  const debouncedDuplicateCheck = useCallback((name: string, website?: string) => {
    // Clear existing timeout
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current)
    }

    // Set new timeout for duplicate checking
    duplicateCheckTimeoutRef.current = setTimeout(() => {
      checkForDuplicates(name, website)
    }, 1000) // Increased from 500ms to 1000ms
  }, []) // Remove dependencies to prevent recreation

  // Fetch favicon when website changes (debounced)
  useEffect(() => {
    if (showNewCompanyModal && newCompanyWebsite && !isLogoManuallyRemoved && !uploadedLogoFile) {
      debouncedFaviconFetch(newCompanyWebsite)
    } else if (!newCompanyWebsite) {
      // Clear favicon when website is cleared
      setNewCompanyLogo(null)
      setIsFetchingFavicon(false)
      setIsProcessingWebsite(false)
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (websiteTimeoutRef.current) {
        clearTimeout(websiteTimeoutRef.current)
      }
    }
  }, [
    newCompanyWebsite,
    showNewCompanyModal,
    isLogoManuallyRemoved,
    uploadedLogoFile,
    debouncedFaviconFetch,
  ])

  // Check for duplicates when name or website changes (debounced)
  useEffect(() => {
    if (showNewCompanyModal && newCompanyName.trim().length >= 3) {
      debouncedDuplicateCheck(newCompanyName, newCompanyWebsite)
    } else {
      setDuplicateCompanies([])
      setShowDuplicateWarning(false)
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current)
      }
    }
  }, [newCompanyName, newCompanyWebsite, showNewCompanyModal, debouncedDuplicateCheck])

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      if (websiteTimeoutRef.current) clearTimeout(websiteTimeoutRef.current)
      if (duplicateCheckTimeoutRef.current) clearTimeout(duplicateCheckTimeoutRef.current)
    }
  }, [])

  // Validate uploaded file
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PNG, JPG, JPEG, or SVG file'
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return 'File size must be less than 5MB'
    }

    return null
  }

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setLogoError(error)
      return
    }

    setLogoError(null)
    setUploadedLogoFile(file)
    setIsLogoManuallyRemoved(false)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setNewCompanyLogo(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle company selection
  const handleSelectCompany = (company: Company) => {
    form.setValue(name, company.id)
    setSelectedCompany(company)
    setOpen(false)
  }

  // Clear selected company
  const handleClearSelection = () => {
    form.setValue(name, undefined)
    setSelectedCompany(null)
  }

  // Reset new company form
  const resetNewCompanyForm = () => {
    setShowNewCompanyModal(false)
    setNewCompanyName('')
    setNewCompanyWebsite('')
    setNewCompanyLogo(null)
    setUploadedLogoFile(null)
    setIsLogoManuallyRemoved(false)
    setDuplicateCompanies([])
    setShowDuplicateWarning(false)
    setLogoError(null)
    setIsProcessingWebsite(false)

    // Clear any pending timeouts
    if (websiteTimeoutRef.current) clearTimeout(websiteTimeoutRef.current)
    if (duplicateCheckTimeoutRef.current) clearTimeout(duplicateCheckTimeoutRef.current)
  }

  // Handle logo removal
  const handleLogoRemove = () => {
    setNewCompanyLogo(null)
    setUploadedLogoFile(null)
    setIsLogoManuallyRemoved(true)
    setLogoError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Create new company
  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return
    if (!newCompanyWebsite.trim()) return

    setIsCreating(true)
    try {
      // Upload logo file if present
      let logoData = null
      if (uploadedLogoFile) {
        const formData = new FormData()
        formData.append('file', uploadedLogoFile)

        const uploadResponse = await fetch('/api/companies/upload-logo-file', {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const { logoId } = await uploadResponse.json()
          logoData = { uploadedLogo: logoId }
        }
      } else if (newCompanyLogo && !isLogoManuallyRemoved) {
        logoData = { defaultUrl: newCompanyLogo }
      }

      const response = await fetch('/api/companies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          website: newCompanyWebsite.trim(),
          logoData,
        }),
      })

      if (response.ok) {
        const { company } = await response.json()
        setSelectedCompany(company)
        form.setValue(name, company.id)
        setOpen(false)
        resetNewCompanyForm()
      }
    } catch (error) {
      console.error('[CompanySelector] Error creating company:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Get logo URL from company data
  const getLogoUrl = (logoSrc: Company['logoSrc']): string | null => {
    if (!logoSrc) return null

    if (typeof logoSrc === 'object') {
      if ('uploadedLogo' in logoSrc && logoSrc.uploadedLogo) {
        const uploadedLogo = logoSrc.uploadedLogo
        if (typeof uploadedLogo === 'object' && 'url' in uploadedLogo) {
          return uploadedLogo.url || null
        }
      }
      if ('defaultUrl' in logoSrc && logoSrc.defaultUrl) {
        return logoSrc.defaultUrl
      }
      return null
    }

    if (typeof logoSrc === 'string') {
      return logoSrc
    }

    return null
  }

  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FieldSet
            label={label}
            description={description}
            promptText={form.formState.errors[name]?.message as string}
            state={form.formState.errors[name] ? 'error' : 'default'}
          >
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    size="md"
                    aria-expanded={open}
                    className={cn(
                      'h-[36px] w-full justify-between text-base text-gray-300',
                      !field.value && 'text-gray-300',
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      {selectedCompany ? (
                        <div className="flex items-center gap-2">
                          <CompanyLogoComponent
                            src={getLogoUrl(selectedCompany.logoSrc)}
                            alt={selectedCompany.name}
                          />
                          <span>{selectedCompany.name}</span>
                        </div>
                      ) : (
                        'Select company'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <div className="flex flex-col">
                  <Command>
                    <CommandInput
                      placeholder="Search companies..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Icon
                            name="spinner"
                            className="text-muted-foreground h-4 w-4 animate-spin"
                          />
                          <span className="text-muted-foreground ml-2 text-sm">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-3 px-4">
                              <p className="text-gray-600 text-center text-sm text-balance">
                                No companies found with that name. Be the first to add it!
                              </p>
                            </div>
                          </CommandEmpty>

                          {/* Suggested Companies from Email Domain */}
                          {suggestedCompanies.length > 0 && (
                            <>
                              <CommandGroup
                                heading={
                                  <>
                                    Suggested
                                    <Icon name="sparkles" size="sm" className="ml-1" />
                                  </>
                                }
                              >
                                {suggestedCompanies.map((company) => (
                                  <CommandItem
                                    key={`suggested-${company.id}`}
                                    value={`suggested-${company.name}`}
                                    onSelect={() => handleSelectCompany(company)}
                                    className="flex cursor-pointer items-center gap-2"
                                  >
                                    <CompanyLogoComponent
                                      src={getLogoUrl(company.logoSrc)}
                                      alt={company.name}
                                    />
                                    <div className="flex flex-col">
                                      <span>{company.name}</span>
                                      {company.website && (
                                        <span className="text-xs text-gray-500">
                                          {company.website}
                                        </span>
                                      )}
                                    </div>
                                    <div className="ml-auto flex items-center gap-1">
                                      <Check
                                        className={cn(
                                          'h-4 w-4',
                                          selectedCompany?.id === company.id
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandSeparator />
                            </>
                          )}

                          {/* Regular Company Results */}
                          <CommandGroup
                            heading={
                              suggestedCompanies.length > 0
                                ? 'Other companies'
                                : 'Existing companies'
                            }
                          >
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={`other-${company.name}`}
                                onSelect={() => handleSelectCompany(company)}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <CompanyLogoComponent
                                  src={getLogoUrl(company.logoSrc)}
                                  alt={company.name}
                                />
                                <div className="flex flex-col">
                                  <span>{company.name}</span>
                                  {company.website && (
                                    <span className="text-xs text-gray-500">{company.website}</span>
                                  )}
                                </div>
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    selectedCompany?.id === company.id
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                  <div className="border-t p-2">
                    <Button
                      variant="solid"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setShowNewCompanyModal(true)
                        setOpen(false)
                        // Auto-populate from email if no search query
                        if (!searchQuery && emailDomain) {
                          autoPopulateFromEmail()
                        } else {
                          setNewCompanyName(searchQuery)
                        }
                      }}
                    >
                      <Icon name="plus-circle" size="md" className="mr-1" />
                      Add your company
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {selectedCompany && (
              <div className="flex">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleClearSelection}
                  className="text-muted-foreground hover:text-destructive h-6 px-2"
                >
                  <Icon name="x" className="size-4" />
                  Clear selection
                </Button>
              </div>
            )}

            <FormMessage />
          </FieldSet>
        )}
      />

      {/* New Company Modal */}
      <Modal
        open={showNewCompanyModal}
        onOpenChange={setShowNewCompanyModal}
        title="Add new company"
        description="Create a new company entry for your organization."
        primaryButton={{
          children: isCreating ? (
            <>
              Saving
              <Icon name="spinner" className="ml-1 h-3 w-3 animate-spin" />
            </>
          ) : (
            'Save'
          ),
          onClick: handleCreateCompany,
          disabled: !newCompanyName.trim() || !newCompanyWebsite.trim() || isCreating,
        }}
        secondaryButton={{
          children: 'Cancel',
          onClick: resetNewCompanyForm,
          disabled: isCreating,
        }}
        showCloseButton={false}
      >
        <NewCompanyModalContent
          newCompanyName={newCompanyName}
          setNewCompanyName={setNewCompanyName}
          newCompanyWebsite={newCompanyWebsite}
          setNewCompanyWebsite={setNewCompanyWebsite}
          newCompanyLogo={newCompanyLogo}
          isFetchingFavicon={isFetchingFavicon}
          isProcessingWebsite={isProcessingWebsite}
          duplicateCompanies={duplicateCompanies}
          showDuplicateWarning={showDuplicateWarning}
          companies={companies}
          suggestedCompanies={suggestedCompanies}
          handleSelectCompany={handleSelectCompany}
          resetNewCompanyForm={resetNewCompanyForm}
          getLogoUrl={getLogoUrl}
          handleFileUpload={handleFileUpload}
          handleLogoRemove={handleLogoRemove}
          fileInputRef={fileInputRef}
          logoError={logoError}
          uploadedLogoFile={uploadedLogoFile}
        />
      </Modal>
    </>
  )
}
