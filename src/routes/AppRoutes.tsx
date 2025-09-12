import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import HomeCliente from '../pages/HomeCliente'
import HomePrestador from '../pages/HomePrestador'
import PageProcurarServico from '../pages/PageProcurarServico'
import PerfilPrestador from '../pages/PerfilPrestador'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/main" element={<MainPage />} />
      <Route path="/home/cliente" element={<HomeCliente />} />
      <Route path="/home/prestador" element={<HomePrestador />} />
      <Route path="/search" element={<PageProcurarServico />} />
      <Route path="/prestador/:id" element={<PerfilPrestador />} />
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  )
}

export default AppRoutes