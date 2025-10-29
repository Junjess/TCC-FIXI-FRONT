import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import HomeCliente from '../pages/HomeCliente'
import HomePrestador from '../pages/HomePrestador'
import PageProcurarServico from '../pages/PageProcurarServico'
import PerfilPrestador from '../pages/PerfilPrestador'
import HistoricoCliente from '../pages/HistoricoCliente'
import PageSolicitacoesPrestador from '../pages/PageSolicitacoesPrestador'
import MinhasAvaliacoes from '../pages/MinhasAvaliacoes'
import PageRecomendacoes from '../pages/PageRecomendacoes'
import PrivateRoute from "./PrivateRoute";
import HistoricoPrestador from '../pages/HistoricoPrestador'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/main" element={<MainPage />} />
      <Route
        path="/home/cliente"
        element={
          <PrivateRoute role="CLIENTE">
            <HomeCliente />
          </PrivateRoute>
        }
      />
      <Route
        path="/home/prestador"
        element={
          <PrivateRoute role="PRESTADOR">
            <HomePrestador />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute role="CLIENTE">
            <PageProcurarServico />
          </PrivateRoute>
        }
      />
      <Route
        path="/historico/cliente"
        element={
          <PrivateRoute role="CLIENTE">
            <HistoricoCliente />
          </PrivateRoute>
        }
      />
      <Route
        path="/prestador/:id"
        element={
          <PrivateRoute role="CLIENTE">
            <PerfilPrestador />
          </PrivateRoute>
        }
      />
      <Route
        path="/solicitacoes"
        element={
          <PrivateRoute role="PRESTADOR">
            <PageSolicitacoesPrestador />
          </PrivateRoute>
        }
      />
      <Route
        path="/avaliacoes"
        element={
          <PrivateRoute role="PRESTADOR">
            <MinhasAvaliacoes />
          </PrivateRoute>
        }
      />
      <Route
        path="/recomendacoes"
        element={
          <PrivateRoute role="CLIENTE">
            <PageRecomendacoes />
          </PrivateRoute>
        }
      />

      <Route
        path="/prestador/historico"
        element={
          <PrivateRoute role="PRESTADOR">
            <HistoricoPrestador />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}

export default AppRoutes;