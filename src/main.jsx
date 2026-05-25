import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {AuthProvider} from './stores/authStore.jsx'
import {ToastProvider} from './components/ui/ToastProvider.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastProvider>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </ToastProvider>
    </StrictMode>,
)
