'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, PlusCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Company, CompanyLogo } from '@/payload-types'
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
import { FieldSet } from '@/components/ui/FieldSet'
import { Icon } from '@/components/ui'
import { CompanyLogo as CompanyLogoComponent } from './CompanyLogo'

type CompanySelectorProps = {
  name: string
  label: string
  description?: string
}

export function CompanySelector({ name, label, description }: CompanySelectorProps) {
  const form = useFormContext()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('')
  const [newCompanyLogo, setNewCompanyLogo] = useState<string | null>(null)
  const [isLogoManuallyRemoved, setIsLogoManuallyRemoved] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isFetchingBrandfetch, setIsFetchingBrandfetch] = useState(false)
  const [hasSearchedBrandfetch, setHasSearchedBrandfetch] = useState(false)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load initial company data if form has a company value
  useEffect(() => {
    const companyId = form.getValues(name)
    if (companyId && !selectedCompany) {
      const fetchCompanyData = async () => {
        try {
          console.log(`[CompanySelector] Fetching company data for ID: ${companyId}`)
          // Fetch the specific company by ID
          const response = await fetch(`/api/companies/${companyId}`)
          if (response.ok) {
            const company = await response.json()
            console.log(`[CompanySelector] Fetched company data:`, company)
            const logoSrc = company.logoSrc
            console.log(`[CompanySelector] Company logo URL: ${logoSrc || '(none)'}`)

            setSelectedCompany(company)
          } else {
            console.error(`[CompanySelector] Error response:`, await response.text())
          }
        } catch (error) {
          console.error('[CompanySelector] Error fetching initial company data:', error)
        }
      }

      fetchCompanyData()
    }
  }, [form, name, selectedCompany])

  // Fetch companies when search query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!open) return

    if (searchQuery) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true)
        try {
          console.log(`[CompanySelector] Searching companies with query: ${searchQuery}`)
          const response = await fetch(`/api/companies?query=${encodeURIComponent(searchQuery)}`)
          const data = await response.json()
          console.log(`[CompanySelector] Company search results:`, data.docs)

          const companyOptions: Company[] = data.docs.map((company: Company) => {
            console.log(
              `[CompanySelector] Company ${company.name} logo: ${company.logoSrc || '(none)'}`,
            )
            return company
          })

          setCompanies(companyOptions)
        } catch (error) {
          console.error('[CompanySelector] Error fetching companies:', error)
        } finally {
          setIsLoading(false)
        }
      }, 300)
    } else {
      // Fetch all companies when no search query
      const fetchAllCompanies = async () => {
        setIsLoading(true)
        try {
          console.log(`[CompanySelector] Fetching all companies`)
          const response = await fetch('/api/companies')
          const data = await response.json()
          console.log(`[CompanySelector] All companies results:`, data.docs)

          const companyOptions: Company[] = data.docs.map((company: Company) => {
            console.log(
              `[CompanySelector] Company ${company.name} logo: ${company.logoSrc || '(none)'}`,
            )
            return company
          })

          setCompanies(companyOptions)
        } catch (error) {
          console.error('[CompanySelector] Error fetching companies:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchAllCompanies()
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, open])

  // Generate Brandfetch CDN URL for a domain
  const generateBrandfetchLogoUrl = (domain: string) => {
    return `https://cdn.brandfetch.io/${domain}/w/48/h/42/symbol?c=1idjh-kE7Sr91f3HSWS`
  }

  // Fetch from Brandfetch when create new company
  const fetchBrandfetchData = async (companyName: string) => {
    if (!companyName) return

    setIsFetchingBrandfetch(true)
    setHasSearchedBrandfetch(false)
    try {
      console.log(`[CompanySelector] Fetching Brandfetch data for: ${companyName}`)
      const response = await fetch(`/api/brandfetch?name=${encodeURIComponent(companyName)}`)
      const { data } = await response.json()
      console.log(`[CompanySelector] Brandfetch response:`, data)

      if (data) {
        if (data.website) {
          setNewCompanyWebsite(data.website)
        }
        if (data.logoSrc) {
          setNewCompanyLogo(data.logoSrc)
        } else {
          setNewCompanyLogo(null)
        }
      } else {
        console.log(`[CompanySelector] No data returned from Brandfetch`)
        setNewCompanyLogo(null)
      }
    } catch (error) {
      console.error('[CompanySelector] Error fetching from Brandfetch:', error)
      setNewCompanyLogo(null)
    } finally {
      setIsFetchingBrandfetch(false)
      setHasSearchedBrandfetch(true)
    }
  }

  // Debounced fetch from Brandfetch when name changes
  useEffect(() => {
    if (showNewCompanyForm && newCompanyName.length > 2) {
      const timer = setTimeout(() => {
        fetchBrandfetchData(newCompanyName)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [newCompanyName, showNewCompanyForm])

  // Generate logo URL when website changes
  useEffect(() => {
    if (showNewCompanyForm && newCompanyWebsite && !newCompanyLogo && !isLogoManuallyRemoved) {
      try {
        const url = new URL(newCompanyWebsite)
        const domain = url.hostname
        const logoUrl = generateBrandfetchLogoUrl(domain)
        setNewCompanyLogo(logoUrl)
        console.log(`[CompanySelector] Set new company logo from website: ${logoUrl}`)
      } catch (error) {
        // Invalid URL, ignore
      }
    }
  }, [newCompanyWebsite, showNewCompanyForm, newCompanyLogo, isLogoManuallyRemoved])

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

  const getLogoUrl = (logoSrc: Company['logoSrc']) => {
    if (!logoSrc) return null

    // If it's a CompanyLogo object
    if (typeof logoSrc === 'object') {
      // First try the url field
      if ('url' in logoSrc && logoSrc.url) {
        return logoSrc.url
      }
      // Then try the upload url
      return logoSrc.url || null
    }

    // If it's a string (direct URL)
    if (typeof logoSrc === 'string') {
      return logoSrc
    }

    // If it's a number (ID), return null as we can't use it directly
    return null
  }

  return (
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
                    'w-full justify-between text-base text-gray-300 h-[36px]',
                    !field.value && 'text-gray-300',
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    {selectedCompany ? (
                      <div className="flex items-center gap-2">
                        <CompanyLogoComponent
                          src={getLogoUrl(selectedCompany.logoSrc)}
                          alt={selectedCompany.name}
                          size={20}
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
            <PopoverContent className="p-0 w-[350px]">
              {!showNewCompanyForm ? (
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
                          className="w-4 h-4 animate-spin text-muted-foreground"
                        />
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          <p className="py-2 px-4 text-sm text-center text-muted-foreground">
                            No companies found.
                          </p>
                        </CommandEmpty>
                        <CommandGroup heading="Companies">
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() => handleSelectCompany(company)}
                              className="flex items-center gap-2"
                            >
                              <CompanyLogoComponent
                                src={getLogoUrl(company.logoSrc)}
                                alt={company.name}
                                size={20}
                              />
                              <span>{company.name}</span>
                              <Check
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  selectedCompany?.id === company.id ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setShowNewCompanyForm(true)
                              setNewCompanyName(searchQuery)
                              if (searchQuery) {
                                fetchBrandfetchData(searchQuery)
                              }
                            }}
                            className="text-blue-600"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add new company
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Add new company</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNewCompanyForm(false)
                        setNewCompanyName('')
                        setNewCompanyWebsite('')
                        setNewCompanyLogo(null)
                        setIsLogoManuallyRemoved(false)
                      }}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-company-name">Company name</Label>
                    <Input
                      id="new-company-name"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="e.g. Acme Inc."
                      className="w-full"
                    />
                  </div>

                  {isFetchingBrandfetch && (
                    <div className="flex items-center justify-center py-2">
                      <Icon name="spinner" className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Searching for company...
                      </span>
                    </div>
                  )}

                  {hasSearchedBrandfetch && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="new-company-website">Company website</Label>
                        <Input
                          id="new-company-website"
                          value={newCompanyWebsite}
                          onChange={(e) => setNewCompanyWebsite(e.target.value)}
                          placeholder="e.g. https://example.com"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Company logo</Label>
                        {newCompanyLogo ? (
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 border border-gray-200 rounded overflow-hidden">
                              <CompanyLogoComponent
                                src={newCompanyLogo}
                                alt="Company logo"
                                size={40}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewCompanyLogo(null)
                                setIsLogoManuallyRemoved(true)
                              }}
                              className="h-7"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-16 border border-dashed border-gray-300 rounded-md">
                            <span className="text-sm text-muted-foreground">
                              {isLogoManuallyRemoved ? 'No logo selected' : 'No logo found'}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCompanyForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={async () => {
                        if (!newCompanyName) return

                        try {
                          const response = await fetch('/api/companies/create', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              name: newCompanyName,
                              website: newCompanyWebsite,
                              logoSrc: newCompanyLogo,
                            }),
                          })

                          const { company, isNew } = await response.json()

                          // Select the newly created or existing company
                          setSelectedCompany(company)
                          setShowNewCompanyForm(false)
                          setNewCompanyName('')
                          setNewCompanyWebsite('')
                          setNewCompanyLogo(null)
                          setOpen(false)

                          if (!isNew) {
                            // Show a message that the company already existed
                            console.log('Company already exists, using existing record')
                          }
                        } catch (error) {
                          console.error('[CompanySelector] Error creating company:', error)
                        }
                      }}
                      disabled={!newCompanyName.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {selectedCompany && (
            <div className="flex">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClearSelection}
                className="h-6 px-2 text-muted-foreground hover:text-destructive"
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
  )
}
