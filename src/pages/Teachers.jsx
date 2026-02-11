import { useNavigate } from 'react-router-dom'
import { teachers } from '../data/classes'

function Teachers() {
  const navigate = useNavigate()

  const handleTeacherClick = (teacherId) => {
    navigate(`/booking/teacher/${teacherId}`)
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="relative z-10 pt-24 pb-20"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5B3B0'
              }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="inline-block mb-8">
            <div className="w-24 h-1.5 rounded-full" style={{ backgroundColor: '#D48D88' }}></div>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-8"
              style={{ color: '#1F2937', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
            Nuestros Profesores
          </h1>
          <p className="text-lg md:text-xl font-body leading-relaxed max-w-3xl" 
             style={{ color: '#4B5563', lineHeight: '1.7' }}>
            Conoce a nuestro equipo de instructores especializados. Cada uno trae años de experiencia y una pasión única por el bienestar.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => handleTeacherClick(teacher.id)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group flex flex-col"
              style={{ 
                boxShadow: '0 4px 16px rgba(183, 61, 55, 0.1)',
                border: '1px solid #E5B3B0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(183, 61, 55, 0.2)'
                e.currentTarget.style.transform = 'translateY(-6px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(183, 61, 55, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div className="h-80 sm:h-96 md:h-[28rem] overflow-hidden relative" 
                   style={{ backgroundColor: '#FAFAFA' }}>
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ 
                    objectPosition: teacher.id === 3 ? 'center center' : 'center top',
                    minHeight: '100%'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center">
                      <span className="text-xl">✨</span>
                    </div>
                    <div>
                      <p className="text-white font-body font-semibold text-sm">Conoce más</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 lg:p-10 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3" style={{ color: '#1F2937', lineHeight: '1.1' }}>
                    {teacher.name}
                  </h3>
                  <div className="inline-block px-4 py-1.5 rounded-full"
                       style={{ backgroundColor: '#FEE2E2' }}>
                    <p className="font-semibold text-xs font-body uppercase tracking-wider" style={{ color: '#B73D37', letterSpacing: '0.1em' }}>
                      {teacher.specialty}
                    </p>
                  </div>
                </div>
                <p className="text-sm md:text-base mb-8 font-body leading-relaxed flex-grow" style={{ color: '#4B5563', lineHeight: '1.7' }}>
                  {teacher.bio}
                </p>
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {teacher.classes.map((className, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-4 py-2 rounded-full font-body font-medium transition-all duration-300"
                      style={{ 
                        backgroundColor: '#E5E7EB',
                        color: '#374151',
                        border: '1px solid #D1D5DB'
                      }}
                    >
                      {className}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTeacherClick(teacher.id)
                  }}
                  type="button"
                  className="w-full py-4 rounded-xl transition-all duration-300 font-heading font-semibold text-sm uppercase tracking-wider relative overflow-hidden group/btn mt-auto"
                  style={{ 
                    background: 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    letterSpacing: '0.1em',
                    boxShadow: '0 4px 12px rgba(183, 61, 55, 0.2)',
                    fontFamily: "'Hanken Grotesk', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #C76661 0%, #B73D37 100%)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 6px 16px rgba(183, 61, 55, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #B73D37 0%, #8B2E29 100%)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 12px rgba(183, 61, 55, 0.2)'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Ver Clases
                    <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Teachers
