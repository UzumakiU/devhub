'use client'

interface AlertProps {
  type: 'error' | 'success' | 'warning'
  message: string
  onClose: () => void
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      button: 'text-red-500 hover:text-red-700'
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      button: 'text-green-500 hover:text-green-700'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-700',
      button: 'text-yellow-500 hover:text-yellow-700'
    }
  }

  const style = styles[type]

  return (
    <div className={`${style.bg} border ${style.text} px-4 py-3 rounded-lg mb-6`}>
      {message}
      <button
        onClick={onClose}
        className={`float-right ${style.button}`}
      >
        ×
      </button>
    </div>
  )
}
