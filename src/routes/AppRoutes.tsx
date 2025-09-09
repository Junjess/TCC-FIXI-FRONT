import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import HomeCliente from '../pages/HomeCliente'


function AppRoutes() {
  return (
    <Routes>
        <Route path="/main" element={<MainPage/>}/>
        <Route path="/home/cliente" element={<HomeCliente/>}/>
        <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  )
}

export default AppRoutes