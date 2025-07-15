'use client'

import { featureFlags } from '@/lib/config'
import FeatureDisabledPage from '@/components/FeatureDisabledPage'

export default function CustomersPage() {
  // Check if customers feature is enabled
  if (!featureFlags.customers) {
    return (
      <FeatureDisabledPage 
        moduleName="Customers"
        description="Customer management and contact organization will be available after CRM completion. Use CRM for now."
        estimatedCompletion="After CRM v1.0"
      />
    )
  }

  // TODO: When re-enabling, restore the original customers implementation
  return null
}
