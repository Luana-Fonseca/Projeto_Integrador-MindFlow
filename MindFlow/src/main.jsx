// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home'
import About from './pages/About'
import IA from './pages/IA'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import MyGlobalStyles from './styles/globalStyles'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyGlobalStyles />
    {/* <Home />
    <IA />
    <About />    */}
    <Login />
    <Cadastro />
  </StrictMode>,
)