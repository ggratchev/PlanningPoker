import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import CreerPartie from './CreerPartie.tsx'
import RejoindrePartie from './RejoindrePartie.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/creer-partie" element={<CreerPartie />} />
        <Route path="/rejoindre-partie" element={<RejoindrePartie />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
