import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home            from '../Pages/Home';
import Catalogo        from '../Pages/Catalogo';
import Login           from '../Pages/Login';
import Dashboard       from '../Pages/Admin/Dashboard';
import Categoria       from '../Pages/Admin/Categoria';
import Produto         from '../Pages/Admin/Produto';
import AddProduto      from '../Pages/Admin/AddProduto';
import EntradaEstoque  from '../Pages/Admin/EntradaEstoque';
import Venda           from '../Pages/Admin/Venda';
import AddVenda        from '../Pages/Admin/AddVenda';
import ContaAPagar     from '../Pages/Admin/ContaAPagar';
import AddContaAPagar  from '../Pages/Admin/AddContaAPagar';
import Despesa         from '../Pages/Admin/Despesa';
import Relatorios      from '../Pages/Admin/Relatorios';
import PrivateRoute    from '../Components/Admin/PrivateRoute';

/** Envolve um elemento com PrivateRoute de forma concisa */
const P = (element: React.ReactElement) => (
  <PrivateRoute>{element}</PrivateRoute>
);

const AppRoutes: React.FC = () => (
  <Routes>
    {/* ── Públicas ── */}
    <Route path="/"        element={<Home />} />
    <Route path="/catalogo" element={<Catalogo />} />
    <Route path="/login"   element={<Login />} />

    {/* ── Administrativas (requerem autenticação) ── */}
    <Route path="/dashboard"                  element={P(<Dashboard />)} />
    <Route path="/categorias"                 element={P(<Categoria />)} />
    <Route path="/produtos"                   element={P(<Produto />)} />
    <Route path="/produtos/novo"              element={P(<AddProduto />)} />
    <Route path="/produtos/editar/:produtoId" element={P(<AddProduto />)} />
    <Route path="/estoque"                    element={P(<EntradaEstoque />)} />
    <Route path="/pdv"                        element={P(<Venda />)} />
    <Route path="/pdv/nova"                   element={P(<AddVenda />)} />
    <Route path="/contas-a-pagar"             element={P(<ContaAPagar />)} />
    <Route path="/contas-a-pagar/nova"        element={P(<AddContaAPagar />)} />
    <Route path="/despesas"                   element={P(<Despesa />)} />
    <Route path="/relatorios"                 element={P(<Relatorios />)} />

    {/* ── Fallback ── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
