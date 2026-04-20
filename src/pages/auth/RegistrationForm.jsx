import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationForm = () => {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Некорректный формат email.');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен содержать не менее 6 символов.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        const res = register(email, password);
        if (!res.ok) {
            setError(res.error || 'Ошибка регистрации');
            return;
        }
        navigate('/login');
    };

    return (
        <div className="min-h-screen pt-28 px-6 flex justify-center">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-bold mb-8">Регистрация</h2>
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Подтвердите пароль</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg px-6 py-2 font-semibold">
                        Зарегистрироваться
                    </button>
                    <p className="text-sm text-center text-gray-400">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="text-white hover:underline">Войти</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
