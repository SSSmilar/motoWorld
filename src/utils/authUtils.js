/** Проверка прав администратора */
export function isAdmin(user) {
  return user?.role === 'admin' || user?.isAdmin === true;
}
