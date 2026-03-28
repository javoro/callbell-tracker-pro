import { MainLayout } from '@/components/layout/MainLayout'
import { LicenseProvider } from '@/features/licencia/LicenseProvider'

function App() {
  return (
    <LicenseProvider>
      <MainLayout />
    </LicenseProvider>
  )
}

export default App
