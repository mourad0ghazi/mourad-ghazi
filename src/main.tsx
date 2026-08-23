import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles/global.css'
import './styles/enhancements.css'
import './styles/tool-workspaces.css'
import './styles/finance-settings.css'
import './styles/notes-reader.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)

if(import.meta.env.PROD&&'serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>undefined))
