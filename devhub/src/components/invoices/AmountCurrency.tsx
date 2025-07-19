import { AmountCurrencyProps, currencyOptions } from './types'

export default function AmountCurrency({ amount, currency, onChange }: AmountCurrencyProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount *
        </label>
        <input
          type="number"
          step="0.01"
          id="amount"
          name="amount"
          value={amount}
          onChange={onChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Currency
        </label>
        <select
          id="currency"
          name="currency"
          value={currency}
          onChange={onChange}
          className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {currencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
