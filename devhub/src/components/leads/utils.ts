export const getStageColor = (stage: string): string => {
  const colors = {
    prospect: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    qualified: 'bg-green-100 text-green-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800'
  }
  return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

export const formatCurrency = (value: string | undefined): string => {
  if (!value) return '-'
  const num = parseFloat(value)
  return isNaN(num) ? '-' : `$${num.toLocaleString()}`
}
