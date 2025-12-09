export function formatCurrency(amount: number, currency: string = 'ADA'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'ADA' ? 'USD' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  
  const formatted = formatter.format(amount)
  return currency === 'ADA' ? formatted.replace('$', '') + ' Ada' : formatted
}

export function formatDate(dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(dateString)
  
  if (format === 'relative') {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"
    
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"
    
    return Math.floor(seconds) + " seconds ago"
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // short format
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    draft: 'bg-gray-100 text-gray-800',
  }
  
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

export function calculateROI(investment: number, returns: number): string {
  if (investment === 0) return '0%'
  const roi = ((returns - investment) / investment) * 100
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`
}