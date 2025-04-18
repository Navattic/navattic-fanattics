'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, PlusCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Company } from '@/payload-types'
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
import { CompanyLogo } from './CompanyLogo'

type CompanySelectorProps = {
  name: string
  label: string
  description?: string
}

type CompanyOption = {
  value: number | string
  label: string
  logo?: string | null
  isNew?: boolean
}

export function CompanySelector({ name, label, description }: CompanySelectorProps) {
  const form = useFormContext()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('')
  const [newCompanyLogo, setNewCompanyLogo] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null)
  const [isFetchingBrandfetch, setIsFetchingBrandfetch] = useState(false)

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

            setSelectedCompany({
              value: company.id,
              label: company.name,
              logo: logoSrc,
            })
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

          const companyOptions: CompanyOption[] = data.docs.map((company: Company) => {
            console.log(
              `[CompanySelector] Company ${company.name} logo: ${company.logoSrc || '(none)'}`,
            )
            return {
              value: company.id,
              label: company.name,
              logo: company.logoSrc,
            }
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

          const companyOptions: CompanyOption[] = data.docs.map((company: Company) => {
            console.log(
              `[CompanySelector] Company ${company.name} logo: ${company.logoSrc || '(none)'}`,
            )
            return {
              value: company.id,
              label: company.name,
              logo: company.logoSrc,
            }
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

  // Fetch from Brandfetch when create new company
  const fetchBrandfetchData = async (companyName: string) => {
    if (!companyName) return

    setIsFetchingBrandfetch(true)
    try {
      console.log(`[CompanySelector] Fetching Brandfetch data for: ${companyName}`)
      const response = await fetch(`/api/brandfetch?name=${encodeURIComponent(companyName)}`)
      const { data } = await response.json()
      console.log(`[CompanySelector] Brandfetch response:`, data)

      if (data) {
        setNewCompanyWebsite(data.website || '')
        setNewCompanyLogo(data.logoSrc)
        console.log(`[CompanySelector] Set new company logo: ${data.logoSrc || '(none)'}`)
      } else {
        console.log(`[CompanySelector] No data returned from Brandfetch`)
      }
    } catch (error) {
      console.error('[CompanySelector] Error fetching from Brandfetch:', error)
    } finally {
      setIsFetchingBrandfetch(false)
    }
  }

  // Create new company
  const handleCreateCompany = async () => {
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
      const companyOption: CompanyOption = {
        value: company.id,
        label: company.name,
        logo: company.logoSrc,
      }

      form.setValue(name, company.id)
      setSelectedCompany(companyOption)
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
  }

  // Reset new company form
  const resetNewCompanyForm = () => {
    setShowNewCompanyForm(false)
    setNewCompanyName('')
    setNewCompanyWebsite('')
    setNewCompanyLogo(null)
  }

  // Handle company selection
  const handleSelectCompany = (company: CompanyOption) => {
    form.setValue(name, company.value)
    setSelectedCompany(company)
    setOpen(false)
  }

  // Clear selected company
  const handleClearSelection = () => {
    form.setValue(name, undefined)
    setSelectedCompany(null)
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
                  aria-expanded={open}
                  className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                >
                  {selectedCompany ? (
                    <div className="flex items-center gap-2">
                      <CompanyLogo
                        src={selectedCompany.logo}
                        alt={selectedCompany.label}
                        size={20}
                      />
                      <span>{selectedCompany.label}</span>
                    </div>
                  ) : (
                    'Select company'
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                              key={company.value}
                              value={company.value.toString()}
                              onSelect={() => handleSelectCompany(company)}
                              className="flex items-center gap-2"
                            >
                              <CompanyLogo src={company.logo} alt={company.label} size={20} />
                              <span>{company.label}</span>
                              <Check
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  selectedCompany?.value === company.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
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
                      onClick={resetNewCompanyForm}
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
                        Fetching company data...
                      </span>
                    </div>
                  )}

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
                          <CompanyLogo src={newCompanyLogo} alt="Company logo" size={40} />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewCompanyLogo(null)}
                          className="h-7"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-16 border border-dashed border-gray-300 rounded-md">
                        <span className="text-sm text-muted-foreground">
                          {isFetchingBrandfetch ? 'Searching for logo...' : 'No logo found'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={resetNewCompanyForm}>
                      Cancel
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={handleCreateCompany}
                      disabled={!newCompanyName.trim()}
                    >
                      Create company
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {selectedCompany && (
            <div className="mt-2 flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-6 px-2 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
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
