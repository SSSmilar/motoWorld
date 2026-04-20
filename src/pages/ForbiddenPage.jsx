import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
    <p className="text-xl mb-6">Доступ запрещён</p>
    <Link to="/" className="bg-red-600 hover:bg-red-700 transition rounded-lg px-6 py-2 font-semibold">
      На главную
    </Link>
  </div>
);

export default ForbiddenPage;
