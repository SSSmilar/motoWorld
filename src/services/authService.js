/**
 * Сервис аутентификации (mock-api).
 * Все данные хранятся в LocalStorage — имитация работы с БД.
 * Ключи:
 *   "mw_users"   — массив зарегистрированных пользователей
 *   "mw_session" — объект текущей сессии { userId, email, role }
 */

import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'users';
const SESSIONS_KEY = 'sessions';

const get_users = () => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch {
        return [];
    }
};

const save_users = (users) => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch { /* storage full or unavailable */ }
};

const get_sessions = () => {
    try {
        const sessions = localStorage.getItem(SESSIONS_KEY);
        return sessions ? JSON.parse(sessions) : {};
    } catch {
        return {};
    }
};

const save_sessions = (sessions) => {
    try {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch { /* storage full or unavailable */ }
};

/** Инициализация: добавляет тестового админа, если его ещё нет */
export const init_admin = () => {
    const users = get_users();
    const admin_exists = users.some(user => user.email === 'admin@test.com');
    if (!admin_exists) {
        const admin = {
            id: uuidv4(),
            email: 'admin@test.com',
            password: 'admin123', // In a real app, hash passwords!
            role: 'admin',
        };
        users.push(admin);
        save_users(users);
    }
};

/** Регистрация нового пользователя (роль всегда user) */
export const register = (email, password) => {
    const users = get_users();
    const user_exists = users.some(user => user.email === email);
    if (user_exists) {
        throw new Error('Пользователь с таким email уже существует');
    }
    const new_user = {
        id: uuidv4(),
        email,
        password, // In a real app, hash passwords!
        role: 'user',
    };
    users.push(new_user);
    save_users(users);
    return new_user;
};

/** Вход по email и паролю */
export const login = (email, password) => {
    const users = get_users();
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        throw new Error('Неверный email или пароль');
    }
    const sessions = get_sessions();
    const session_token = uuidv4();
    sessions[session_token] = { userId: user.id, role: user.role, email: user.email };
    save_sessions(sessions);
    localStorage.setItem('session_token', session_token);
    return { session_token, user };
};

/** Выход — удаление сессии */
export const logout = () => {
    const session_token = localStorage.getItem('session_token');
    if (session_token) {
        const sessions = get_sessions();
        delete sessions[session_token];
        save_sessions(sessions);
        localStorage.removeItem('session_token');
    }
};

/** Получить текущую сессию (или null) */
export const get_current_user = () => {
    const session_token = localStorage.getItem('session_token');
    if (!session_token) {
        return null;
    }
    const sessions = get_sessions();
    return sessions[session_token] || null;
};

export const get_user_by_id = (userId) => {
    const users = get_users();
    return users.find(user => user.id === userId);
};
