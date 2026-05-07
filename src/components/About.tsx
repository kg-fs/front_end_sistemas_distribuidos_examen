import React from 'react';

const About: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-[#F8F8F8] to-[#E8F5F2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Misión */}
          <div className="text-center md:text-left">
            <div className="mb-8">
              <div className="w-16 h-16 bg-[#496B90] rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7m0 0l9-11v11m-11 0h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2z" />
                </svg>
              </div>
              <h2 className="text-3xl text-[#496B90] font-light tracking-wide mb-6">
                Nuestra Misión
              </h2>
              <p className="text-[#A2A09D] leading-relaxed text-lg">
                En <strong className="text-[#496B90]">Floralia</strong>, nos dedicamos a crear experiencias florales únicas y memorables. 
                Nuestra misión es conectar a las personas con la belleza natural de las flores, 
                transformando momentos ordinarios en celebraciones extraordinarias a través de arreglos florales 
                artesanales y servicio excepcional.
              </p>
            </div>

            {/* Valores */}
            <div className="mt-12">
              <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-6">
                Nuestros Valores
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-[#496B90]">Calidad</strong>
                    <p className="text-[#A2A09D] text-sm mt-1">Flores frescas y arreglos impecables</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-[#496B90]">Creatividad</strong>
                    <p className="text-[#A2A09D] text-sm mt-1">Diseños únicos y personalizados</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-[#496B90]">Pasión</strong>
                    <p className="text-[#A2A09D] text-sm mt-1">Amor por lo que hacemos en cada detalle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visión */}
          <div className="text-center md:text-left">
            <div className="mb-8">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm4 8a2 2 0 100 4 2 2 0 000-4zm-12 0a2 2 0 110 4 2 2 0 000-4z" />
                </svg>
              </div>
              <h2 className="text-3xl text-[#496B90] font-light tracking-wide mb-6">
                Nuestra Visión
              </h2>
              <p className="text-[#A2A09D] leading-relaxed text-lg">
                Aspiramos a ser <strong className="text-[#496B90]">líderes en el mercado floral</strong>, 
                reconocidos por nuestra innovación, sostenibilidad y compromiso con la satisfacción del cliente. 
                Visualizamos un futuro donde cada celebración esté adornada con la perfección y frescura 
                que solo <strong className="text-[#496B90]">Floralia</strong> puede ofrecer.
              </p>
            </div>

            {/* Estadísticas */}
            <div className="mt-12 bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-6">
                Nuestro Impacto
              </h3>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl text-[#D4AF37] font-bold mb-2">500+</div>
                  <div className="text-[#A2A09D] text-sm">Clientes Felices</div>
                </div>
                <div>
                  <div className="text-3xl text-[#496B90] font-bold mb-2">1000+</div>
                  <div className="text-[#A2A09D] text-sm">Arreglos Creados</div>
                </div>
                <div>
                  <div className="text-3xl text-[#D4AF37] font-bold mb-2">5★</div>
                  <div className="text-[#A2A09D] text-sm">Calificación Promedio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
