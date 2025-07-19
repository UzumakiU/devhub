export const getStageColor = (stage: string): string => {
  const colors = {
    prospect: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
    contacted: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300',
    qualified: 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300',
    proposal: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300',
    negotiation: 'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300',
    closed_won: 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300',
    closed_lost: 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300'
  }
  return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
}

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-700 dark:text-green-400 font-semibold'
  if (score >= 60) return 'text-yellow-700 dark:text-yellow-400 font-semibold'
  if (score >= 40) return 'text-orange-700 dark:text-orange-400 font-semibold'
  return 'text-red-700 dark:text-red-400 font-semibold'
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

export const formatCurrency = (value: string | undefined): string => {
  if (!value) return '-'
  const num = parseFloat(value)
  return isNaN(num) ? '-' : `$${num.toLocaleString()}`
}
