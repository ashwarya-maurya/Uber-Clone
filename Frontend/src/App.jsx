import React from 'react'
import { Route, Routes } from 'react-router-dom'
import 'leaflet/dist/leaflet.css';
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import CaptainLogin from './pages/CaptainLogin'
import CaptainSignup from './pages/CaptainSignup'
import Home from './pages/Home'
import UserProtectedWrap from './pages/UserProtectedWrap'
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectedWrap from './pages/CaptainProtectedWrap'
import CaptianLogout from './pages/CaptianLogout'
import Riding from './pages/Riding'
import CaptainRiding from './pages/CaptainRiding'
import UserPayment from './pages/UserPayment'
import CaptainPayment from './pages/CaptainPayment'

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public routes — no authentication required */}
        <Route path='/' element={<Start />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain_login' element={<CaptainLogin />} />
        <Route path='/captain_signup' element={<CaptainSignup />} />

        {/* User protected routes — requires valid user token */}
        <Route path='/home' element={<UserProtectedWrap><Home /></UserProtectedWrap>} />
        <Route path='/logout' element={<UserProtectedWrap><UserLogout /></UserProtectedWrap>} />
        <Route path='/riding' element={<UserProtectedWrap><Riding /></UserProtectedWrap>} />
        <Route path='/user_payment' element={<UserProtectedWrap><UserPayment /></UserProtectedWrap>} />

        {/* Captain protected routes — requires valid captain token */}
        <Route path='/captain_home' element={<CaptainProtectedWrap><CaptainHome /></CaptainProtectedWrap>} />
        <Route path='/captain_logout' element={<CaptainProtectedWrap><CaptianLogout /></CaptainProtectedWrap>} />
        <Route path='/confirm_ride' element={<CaptainProtectedWrap><CaptainRiding /></CaptainProtectedWrap>} />
        <Route path='/captain_payment' element={<CaptainProtectedWrap><CaptainPayment /></CaptainProtectedWrap>} />
      </Routes>
    </div>
  )
}

export default App