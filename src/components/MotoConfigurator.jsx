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
  const [orderId, setOrderId] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

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
        setValidationError('');
        setIsValid(true);
      });
  };

  // Переключение выбора детали
  const handlePartToggle = (partId) => {
    const newSelection = selectedPartIds.includes(partId)
      ? selectedPartIds.filter(id => id !== partId)
      : [...selectedPartIds, partId];
    
    setSelectedPartIds(newSelection);
    
    // Валидация на фронтенде (согласно требованиям бэкенда)
    const part = allParts.find(p => p.id === partId);
    if (!selectedPartIds.includes(partId)) {
        if (!part.compatible_with.includes(selectedVehicle.category.toLowerCase())) {
            setValidationError(`Запчасть ${part.name} не совместима с категорией ${selectedVehicle.category}`);
            setIsValid(false);
            return;
        }
    }
    setValidationError('');
    setIsValid(true);
  };

  // Отправка заказа
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!isValid) return;

    const orderData = {
      customer_name: customerName,
      phone: phone,
      vehicle_id: selectedVehicle.id,
      selected_part_ids: selectedPartIds,
      total_price: calculateTotal()
    };

    fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrderSuccess(true);
          setOrderId(data.order_id);
          setShowModal(false);
          // Очистка конфигуратора
          setCustomerName('');
          setPhone('');
          // Сброс выбора
          if (vehicles.length > 0) {
              const defaultVehicle = vehicles[0];
              setSelectedVehicle(defaultVehicle);
              fetch(`${API_URL}/vehicles/${defaultVehicle.id}/parts`)
                .then(res => res.json())
                .then(defaultParts => {
                  setSelectedPartIds(defaultParts.map(p => p.id));
                });
          }
        } else {
            setValidationError(data.error || 'Ошибка при оформлении заказа');
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

  // Фильтрация запчастей: стоковые + альтернативный тюнинг той же категории
  const getVisibleParts = () => {
      if (!selectedVehicle) return [];
      const vehicleCategory = selectedVehicle.category.toLowerCase();
      return allParts.filter(part => 
          part.compatible_with && part.compatible_with.includes(vehicleCategory)
      );
  };

  return (
    <div className="container mt-5 text-dark">
      <div className="card shadow-lg bg-light p-4">
        <h2 className="text-center mb-4 text-dark">Интерактивный конфигуратор мототехники</h2>
        
        <div className="row">
          {/* Слева: Выбор и карточка мотоцикла */}
          <div className="col-md-4">
            <h4 className="text-dark">Выберите модель:</h4>
            <select 
              className="form-select mb-3" 
              onChange={(e) => handleVehicleSelect(vehicles.find(v => v.id === parseInt(e.target.value)))}
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
                  <h5 className="card-title text-dark">{selectedVehicle.name}</h5>
                  <p className="card-text text-dark">Базовая цена: {selectedVehicle.price.toLocaleString()} ₽</p>
                  <p className="badge bg-primary">{selectedVehicle.category}</p>
                </div>
              </div>
            )}
          </div>

          {/* По центру: Список компонентов */}
          <div className="col-md-5">
            <h4 className="text-dark">Компоненты и тюнинг:</h4>
            <div className="list-group overflow-auto" style={{maxHeight: '400px'}}>
              {getVisibleParts().map(part => (
                <label key={part.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="text-dark">
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
            <h4 className="text-dark">Итого:</h4>
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
                Заказ успешно оформлен! Номер вашего заказа: <strong>{orderId}</strong>
              </div>
            )}

            <button 
              className="btn btn-success btn-lg w-100 mt-3"
              disabled={!isValid || !selectedVehicle}
              onClick={() => setShowModal(true)}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно оформления заказа */}
      {showModal && (
          <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog">
                  <div className="modal-content">
                      <div className="modal-header">
                          <h5 className="modal-title text-dark">Оформление заказа</h5>
                          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <form onSubmit={handlePlaceOrder}>
                          <div className="modal-body">
                              <div className="mb-3">
                                  <label className="form-label text-dark">Имя</label>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required 
                                  />
                              </div>
                              <div className="mb-3">
                                  <label className="form-label text-dark">Телефон</label>
                                  <input 
                                    type="tel" 
                                    className="form-control" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required 
                                  />
                              </div>
                          </div>
                          <div className="modal-footer">
                              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Отмена</button>
                              <button type="submit" className="btn btn-primary">Подтвердить заказ</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MotoConfigurator;
