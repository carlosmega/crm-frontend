/**
 * Use Customer Addresses Hook
 *
 * Hook para obtener las direcciones disponibles de un customer (Account o Contact)
 * Usado en el diálogo "Use Customer Address" para auto-fill shipping address
 */

import { useState, useEffect } from 'react'
import { accountService } from '@/features/accounts/api/account-service'
import { contactService } from '@/features/contacts/api/contact-service'
import type { Account } from '@/core/contracts/entities/account'
import type { Contact } from '@/core/contracts/entities/contact'

export interface CustomerAddress {
  id: string
  label: string
  type: 'primary' | 'secondary'
  name?: string
  line1?: string
  line2?: string
  city?: string
  stateOrProvince?: string
  postalCode?: string
  country?: string
}

interface UseCustomerAddressesOptions {
  customerId: string
  customerType: 'account' | 'contact'
  enabled?: boolean
}

/**
 * Hook para obtener direcciones de un customer
 *
 * @example
 * ```tsx
 * const { addresses, loading, error } = useCustomerAddresses({
 *   customerId: order.customerid,
 *   customerType: order.customeridtype,
 * })
 * ```
 */
export function useCustomerAddresses({
  customerId,
  customerType,
  enabled = true,
}: UseCustomerAddressesOptions) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !customerId) {
      return
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true)
        setError(null)

        if (customerType === 'account') {
          // Fetch Account
          const account = await accountService.getById(customerId)
          if (!account) {
            // In mock mode, customerid may not match any accountid - return empty
            setAddresses([])
            return
          }

          const addressList: CustomerAddress[] = []

          // Primary Address (address1_*)
          if (account.address1_line1 || account.address1_city) {
            addressList.push({
              id: `${customerId}-primary`,
              label: 'Primary Address',
              type: 'primary',
              name: account.name,
              line1: account.address1_line1,
              line2: account.address1_line2,
              city: account.address1_city,
              stateOrProvince: account.address1_stateorprovince,
              postalCode: account.address1_postalcode,
              country: account.address1_country,
            })
          }

          // Secondary Address (address2_*) - Only for Accounts
          if (account.address2_line1 || account.address2_city) {
            addressList.push({
              id: `${customerId}-secondary`,
              label: 'Secondary Address',
              type: 'secondary',
              name: account.name,
              line1: account.address2_line1,
              line2: account.address2_line2,
              city: account.address2_city,
              stateOrProvince: account.address2_stateorprovince,
              postalCode: account.address2_postalcode,
              country: account.address2_country,
            })
          }

          setAddresses(addressList)
        } else {
          // Fetch Contact
          const contact = await contactService.getById(customerId)
          if (!contact) {
            // In mock mode, customerid may not match any contactid - return empty
            setAddresses([])
            return
          }

          const addressList: CustomerAddress[] = []

          // Primary Address (address1_*) - Contacts only have primary
          if (contact.address1_line1 || contact.address1_city) {
            addressList.push({
              id: `${customerId}-primary`,
              label: 'Primary Address',
              type: 'primary',
              name: contact.fullname,
              line1: contact.address1_line1,
              line2: contact.address1_line2,
              city: contact.address1_city,
              stateOrProvince: contact.address1_stateorprovince,
              postalCode: contact.address1_postalcode,
              country: contact.address1_country,
            })
          }

          setAddresses(addressList)
        }
      } catch (err) {
        console.error('Error fetching customer addresses:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setAddresses([])
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [customerId, customerType, enabled])

  return {
    addresses,
    loading,
    error,
    hasAddresses: addresses.length > 0,
  }
}
