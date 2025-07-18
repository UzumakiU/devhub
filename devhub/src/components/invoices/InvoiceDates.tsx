import { InvoiceDatesProps } from './types'

export default function InvoiceDates({ issueDate, dueDate, paidDate, status, onChange }: InvoiceDatesProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900 border-b pb-2">Dates</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
            Issue Date *
          </label>
          <input
            type="date"
            id="issue_date"
            name="issue_date"
            value={issueDate}
            onChange={onChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={dueDate}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {status === 'paid' && (
          <div>
            <label htmlFor="paid_date" className="block text-sm font-medium text-gray-700">
              Paid Date
            </label>
            <input
              type="date"
              id="paid_date"
              name="paid_date"
              value={paidDate}
              onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}
