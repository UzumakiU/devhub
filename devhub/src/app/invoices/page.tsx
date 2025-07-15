'use client'

import { featureFlags } from '@/lib/config'
import FeatureDisabledPage from '@/components/FeatureDisabledPage'

export default function InvoicesPage() {
  // Check if invoices feature is enabled
  if (!featureFlags.invoices) {
    return (
      <FeatureDisabledPage 
        moduleName="Invoices"
        description="Invoice generation and billing management will be available after CRM completion."
        estimatedCompletion="After CRM v1.0"
      />
    )
  }

  // TODO: When re-enabling, restore the original invoices implementation
  return null
}
