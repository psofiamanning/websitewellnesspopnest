function TimeSlotSelector({ availableTimes, selectedTime, onTimeSelect }) {
  if (!availableTimes || availableTimes.length === 0) {
    return (
      <div className="rounded-lg p-4 text-body font-body border-2"
           style={{ 
             backgroundColor: '#faf9f9',
             borderColor: '#E5B3B0'
           }}>
        No hay horarios disponibles para esta fecha
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 border-2"
         style={{ 
           borderColor: '#E5B3B0',
           boxShadow: '0 2px 8px rgba(183, 61, 55, 0.05)'
         }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {availableTimes.map((time) => {
          const isSelected = selectedTime === time
          
          return (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              className={`
                relative py-3 px-4 rounded-lg font-medium text-base transition-all duration-300 transform font-body
                border-2 min-h-[48px] flex items-center justify-center
                ${isSelected
                  ? 'text-primary shadow-lg scale-105 border-primary ring-2 ring-primary ring-offset-2 font-semibold'
                  : 'text-body hover:scale-105 border-transparent'
                }
              `}
              style={isSelected
                ? {
                    backgroundColor: '#E5B3B0',
                    borderColor: '#B73D37',
                    boxShadow: '0 4px 12px rgba(183, 61, 55, 0.25)'
                  }
                : {
                    backgroundColor: '#faf9f9',
                    borderColor: '#DED5D5'
                  }
              }
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.target.style.backgroundColor = '#E5B3B0'
                  e.target.style.borderColor = '#D48D88'
                  e.target.style.boxShadow = '0 2px 6px rgba(183, 61, 55, 0.15)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.backgroundColor = '#faf9f9'
                  e.target.style.borderColor = '#DED5D5'
                  e.target.style.boxShadow = 'none'
                }
              }}
            >
              <span className="relative z-10">{time}</span>
              {isSelected && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md z-20"
                      style={{ 
                        backgroundColor: '#B73D37',
                        boxShadow: '0 2px 8px rgba(183, 61, 55, 0.3)'
                      }}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TimeSlotSelector
