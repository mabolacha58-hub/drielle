import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Feed } from './pages/Feed'
import { Jobs } from './pages/Jobs'
import { JobDetail } from './pages/JobDetail'
import { Marketplace } from './pages/Marketplace'
import { ProductDetail } from './pages/ProductDetail'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { NotFound } from './pages/NotFound'
import { RegisterCompany } from './pages/RegisterCompany'
import { PublishJob } from './pages/PublishJob'
import { PublishService } from './pages/PublishService'
import { Admin } from './pages/Admin'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'feed', element: <Feed /> },
      { path: 'vagas', element: <Jobs /> },
      { path: 'vagas/:id', element: <JobDetail /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'marketplace/:id', element: <ProductDetail /> },
      { path: 'login', element: <Login /> },
      { path: 'registar-empresa', element: <RegisterCompany /> },
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: 'mensagens', element: <ProtectedRoute><Messages /></ProtectedRoute> },
      { path: 'perfil/:id', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'publicar-vaga', element: <ProtectedRoute><PublishJob /></ProtectedRoute> },
      { path: 'publicar-servico', element: <ProtectedRoute><PublishService /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute><Admin /></ProtectedRoute> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
