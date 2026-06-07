import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

const MotoConfigurator = () => {
  const [vehicles, setVehicles] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Загрузка всех продуктов при старте
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        const v = data.filter(p => p.type === 'vehicle');
        const p = data.filter(p => p.type === 'part');
        setVehicles(v);
        setAllParts(p);
        if (v.length > 0) {
          handleVehicleSelect(v[0]);
        }
      })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  // При выборе мотоцикла загружаем его стоковые детали
  const handleVehicleSelect = (vehicle) => {
    if (!vehicle) return;
    setSelectedVehicle(vehicle);
    setOrderSuccess(false);
    fetch(`${API_URL}/vehicles/${vehicle.id}/parts`)
      .then(res => res.json())
      .then(defaultParts => {
        const ids = defaultParts.map(p => p.id);
        setSelectedPartIds(ids);
        validateConfig(vehicle.id, ids);
      });
  };

  // Валидация конфигурации через бэкенд
  const validateConfig = (vehicleId, partIds) => {
    fetch(`${API_URL}/validate-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId, selected_part_ids: partIds })
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsValid(true);
          setValidationError('');
        } else {
          setIsValid(false);
          setValidationError(data.error);
        }
      });
  };

  // Переключение выбора детали
  const handlePartToggle = (partId) => {
    const newSelection = selectedPartIds.includes(partId)
      ? selectedPartIds.filter(id => id !== partId)
      : [...selectedPartIds, partId];
    
    setSelectedPartIds(newSelection);
    validateConfig(selectedVehicle.id, newSelection);
  };

  // Отправка заказа
  const handlePlaceOrder = () => {
    if (!isValid) return;

    const orderData = {
      vehicle_id: selectedVehicle.id,
      part_ids: selectedPartIds,
      total_price: calculateTotal()
    };

    fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
      .then(res => {
        if (res.ok) {
          setOrderSuccess(true);
        }
      });
  };

  const calculateTotal = () => {
    if (!selectedVehicle) return 0;
    const partsTotal = allParts
      .filter(p => selectedPartIds.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    return selectedVehicle.price + partsTotal;
  };

  return (
    <div className="container mt-5 text-dark">
      <div className="card shadow-lg bg-light p-4">
        <h2 className="text-center mb-4">Интерактивный конфигуратор мототехники</h2>
        
        <div className="row">
          {/* Слева: Выбор и карточка мотоцикла */}
          <div className="col-md-4">
            <h4>Выберите модель:</h4>
            <select 
              className="form-select mb-3" 
              onChange={(e) => handleVehicleSelect(vehicles.find(v => v.id === e.target.value))}
              value={selectedVehicle?.id || ''}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            {selectedVehicle && (
              <div className="card h-100">
                <img src={selectedVehicle.image} className="card-img-top" alt={selectedVehicle.name} />
                <div className="card-body">
                  <h5 className="card-title">{selectedVehicle.name}</h5>
                  <p className="card-text">Базовая цена: {selectedVehicle.price.toLocaleString()} ₽</p>
                  <p className="badge bg-primary">{selectedVehicle.category}</p>
                </div>
              </div>
            )}
          </div>

          {/* По центру: Список компонентов */}
          <div className="col-md-5">
            <h4>Компоненты и тюнинг:</h4>
            <div className="list-group overflow-auto" style={{maxHeight: '400px'}}>
              {allParts.map(part => (
                <label key={part.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <input 
                      type="checkbox" 
                      className="form-check-input me-2"
                      checked={selectedPartIds.includes(part.id)}
                      onChange={() => handlePartToggle(part.id)}
                    />
                    {part.name}
                  </div>
                  <span className="text-muted">+{part.price.toLocaleString()} ₽</span>
                </label>
              ))}
            </div>
          </div>

          {/* Справа: Итог и валидация */}
          <div className="col-md-3 border-start">
            <h4>Итого:</h4>
            <div className="display-6 mb-3 text-primary">
              {calculateTotal().toLocaleString()} ₽
            </div>

            {validationError && (
              <div className="alert alert-danger" role="alert">
                {validationError}
              </div>
            )}

            {orderSuccess && (
              <div className="alert alert-success" role="alert">
                Заказ успешно оформлен!
              </div>
            )}

            <button 
              className="btn btn-success btn-lg w-100 mt-3"
              disabled={!isValid || !selectedVehicle || orderSuccess}
              onClick={handlePlaceOrder}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotoConfigurator;
