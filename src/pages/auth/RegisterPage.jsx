import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный формат email';
    if (!password) e.password = 'Введите пароль';
    else if (password.length < 8) e.password = 'Пароль должен быть не менее 8 символов';
    if (password !== confirm) e.confirm = 'Пароли не совпадают';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const res = register(email, password);
    if (!res.ok) { setErrors({ form: res.error }); return; }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24">
      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold text-center">Регистрация</h1>

        {errors.form && <p className="text-red-400 text-sm text-center">{errors.form}</p>}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500" />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Подтверждение пароля</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500" />
          {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
        </div>

        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg py-2 font-semibold">
          Зарегистрироваться
        </button>

        <p className="text-sm text-center text-gray-400">
          Уже есть аккаунт? <Link to="/login" className="text-red-400 hover:underline">Войти</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
