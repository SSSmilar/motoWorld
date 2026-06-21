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
const LEGACY_USERS_KEY = 'mw_users';
const LEGACY_SESSIONS_KEY = 'mw_session';

const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

/** Миграция данных из старых ключей localStorage */
const migrate_legacy_storage = () => {
    try {
        if (!localStorage.getItem(USERS_KEY)) {
            const legacyUsers = localStorage.getItem(LEGACY_USERS_KEY);
            if (legacyUsers) {
                localStorage.setItem(USERS_KEY, legacyUsers);
            }
        }
        if (!localStorage.getItem(SESSIONS_KEY)) {
            const legacySessions = localStorage.getItem(LEGACY_SESSIONS_KEY);
            if (legacySessions) {
                localStorage.setItem(SESSIONS_KEY, legacySessions);
            }
        }
    } catch { /* ignore */ }
};

const get_users = () => {
    try {
        migrate_legacy_storage();
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

const DEFAULT_ADMIN = {
    email: 'admin@test.com',
    password: 'adminpassword', // plaintext — как у остальных пользователей в mock-api
    role: 'admin',
};

/** Инициализация: гарантирует тестового админа admin@test.com в localStorage */
export const init_admin = () => {
    migrate_legacy_storage();
    const users = get_users();
    const adminEmail = normalizeEmail(DEFAULT_ADMIN.email);
    const idx = users.findIndex((user) => normalizeEmail(user.email) === adminEmail);

    if (idx >= 0) {
        const admin = users[idx];
        users[idx] = {
            ...admin,
            email: DEFAULT_ADMIN.email,
            password: DEFAULT_ADMIN.password,
            role: DEFAULT_ADMIN.role,
        };
        save_users(users);
        return;
    }

    users.push({ id: uuidv4(), ...DEFAULT_ADMIN });
    save_users(users);
};

const find_user_by_email = (users, email) =>
    users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));

/** Регистрация нового пользователя (роль всегда user) */
export const register = (email, password) => {
    init_admin();
    const users = get_users();
    const normalizedEmail = normalizeEmail(email);
    const user_exists = users.some((user) => normalizeEmail(user.email) === normalizedEmail);
    if (user_exists) {
        throw new Error('Пользователь с таким email уже существует');
    }
    const new_user = {
        id: uuidv4(),
        email: normalizedEmail,
        password,
        role: 'user',
    };
    users.push(new_user);
    save_users(users);
    return new_user;
};

/** Вход по email и паролю */
export const login = (email, password) => {
    init_admin();
    const users = get_users();
    const user = find_user_by_email(users, email);
    if (!user || user.password !== password) {
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
