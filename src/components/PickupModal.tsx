import React, { useState } from 'react';

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  numOrder: number;
  onSuccess: (pickupData: any) => void;
}

const PickupModal: React.FC<PickupModalProps> = ({ isOpen, onClose, numOrder, onSuccess }) => {
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Llamar al endpoint de pickup/create
      const response = await fetch('http://177.7.42.180:3000/api/pickup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Num_order: numOrder,
          Pickup_date: pickupDate,
          Pickup_time: pickupTime,
          Status: 'pendiente'
        })
      });

      if (!response.ok) {
        throw new Error(`Error al crear pickup: ${response.status}`);
      }

      const pickupData = await response.json();
      console.log('✅ Pickup creado:', pickupData);
      
      onSuccess(pickupData);
      onClose();
      
      // Resetear formulario
      setPickupDate('');
      setPickupTime('');
      
    } catch (err) {
      console.error('❌ Error creando pickup:', err);
      setError('Error al programar la entrega. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPickupDate('');
      setPickupTime('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light text-[#496B90]">
            Programar Entrega
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-[#A2A09D]">
            Orden N°: <span className="font-medium text-[#496B90]">{numOrder}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#496B90] mb-2">
              Fecha de Entrega
            </label>
            <input
              type="date"
              required
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
              min={new Date().toISOString().split('T')[0]} // Solo fechas futuras
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#496B90] mb-2">
              Hora de Entrega
            </label>
            <input
              type="time"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
              min="09:00"
              max="18:00"
            />
            <p className="text-xs text-[#A2A09D] mt-1">
              Horario de atención: 9:00 AM - 6:00 PM
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-[#A2A09D]/30 text-[#A2A09D] rounded-lg hover:bg-[#F8F8F8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#496B90] text-white py-2 rounded-lg font-medium hover:bg-[#3A5270] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Programando...' : 'Confirmar Entrega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickupModal;
