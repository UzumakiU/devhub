import { CustomerSelectionProps } from './types'

export default function CustomerSelection({ customers, selectedCustomerId, onChange }: CustomerSelectionProps) {
  return (
    <div>
      <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
        Customer *
      </label>
      <select
        id="customer_id"
        name="customer_id"
        value={selectedCustomerId}
        onChange={onChange}
        required
        className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a customer...</option>
        {customers.map(customer => (
          <option key={customer.system_id} value={customer.system_id}>
            {customer.name} ({customer.system_id})
          </option>
        ))}
      </select>
    </div>
  )
}
