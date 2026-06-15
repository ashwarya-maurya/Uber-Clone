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
        <Route path='/' element={<Start/>}/>
        <Route path='/home' element={<UserProtectedWrap><Home/></UserProtectedWrap>}/>
        <Route path='/login' element={<UserLogin/>}/>
        <Route path='/signup' element={<UserSignup/>}/>
        <Route path='/logout' element={<UserProtectedWrap><UserLogout/></UserProtectedWrap>}/>
        <Route path='/riding' element={<Riding/>}/>
        <Route path='/user_payment' element={<UserPayment/>} />
        <Route path='/captain_login' element={<CaptainLogin/>} />
        <Route path='/captain_signup' element={<CaptainSignup/>} />
        <Route path='/confirm_ride' element={<CaptainRiding/>}/>
        <Route path='/captain_payment' element={<CaptainPayment/>} />
        <Route path='/captain_home' element={<CaptainProtectedWrap><CaptainHome/></CaptainProtectedWrap>}/>
        <Route path='/captain_logout' element={<CaptainProtectedWrap><CaptianLogout/></CaptainProtectedWrap>}/>
      </Routes>
    </div>
  )
}

export default App