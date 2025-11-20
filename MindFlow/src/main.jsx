// src/main.jsx
import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client';
import Home from './pages/Home'
import About from './pages/About'
import IA from './pages/IA'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import MyGlobalStyles from './styles/globalStyles'

const PAGE_STORAGE_KEY = 'lastVisitedPage'; // Chave para o localStorage

function App() {
  // 1. LÊ o estado inicial do localStorage
  // Se houver um valor salvo, usa ele. Caso contrário, usa 'home'.
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
    return savedPage ? savedPage : 'home';
  });

  // 2. SALVA o estado no localStorage sempre que currentPage mudar
  useEffect(() => {
    console.log('📝 Salvando página no localStorage:', currentPage);
    localStorage.setItem(PAGE_STORAGE_KEY, currentPage);
  }, [currentPage]); // Este efeito executa sempre que currentPage é atualizado

  const navigateTo = (page) => {
    console.log('🚀 Navegando e atualizando estado para:', page);
    // Esta chamada naturalmente aciona o useEffect acima
    setCurrentPage(page);
  }

  // console.log('📄 Página atual:', currentPage) // DEBUG (Pode ser removido)

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} />
      case 'about':
        return <About navigateTo={navigateTo} />
      case 'ia':
        return <IA navigateTo={navigateTo} />
      case 'login':
        return <Login navigateTo={navigateTo} />
      case 'cadastro':
        return <Cadastro navigateTo={navigateTo} />
      case 'dashboard':
        return <Dashboard navigateTo={navigateTo} />
      default:
        return <Home navigateTo={navigateTo} />
    }
  }

  return (
    <>
      <MyGlobalStyles />
      {renderCurrentPage()}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)