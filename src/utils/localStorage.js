/** Чтение JSON-массива или объекта из localStorage */
export function readLocalStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Запись данных в localStorage, возвращает записанное значение */
export function updateLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

/** Алиас для updateLocalStorage */
export function writeLocalStorage(key, data) {
  return updateLocalStorage(key, data);
}
