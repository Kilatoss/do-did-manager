/**
 * src/js/app.js
 * Ponto de entrada da aplicação. Responsável pela inicialização e pelo Router.
 */

import { renderLoginView } from './views/loginView.js';
// Agora importamos a vista real do Dashboard
import { renderDashboardView } from './views/dashboardView.js';

// --- 1. Gestão de Estado (Store) ---
const AppStore = {
    currentUser: null, // Começa vazio, será preenchido pelo Login
    categories: [], 
    activeCategory: null, 
    viewMode: 'Table' 
};

function updateNavbar(user) {
    const navbar = document.querySelector('.titlebar');
    
    if (!navbar) return;

    if (user) {
        // --- MODO DASHBOARD (Utilizador Logado) ---
        // Mostra mensagem de boas-vindas e talvez um botão de Logout
        navbar.innerHTML = `
            <ul>
                <li>Bem-vindo, ${user.username}</li>
            </ul>
        `;
    } else {
        // --- MODO LOGIN (Padrão) ---
        // Volta ao menu original "File / About"
        navbar.innerHTML = `
            <ul>
                <li>File</li>
                <li>About</li>
            </ul>
            Cool Titlebar
        `;
    }
}

// --- 2. Router ---
function router() {
    const appContainer = document.getElementById('app');
    
    // Limpa o conteúdo anterior
    if (appContainer) {
        appContainer.innerHTML = '';
    } else {
        console.error('Contentor #app não encontrado.');
        return;
    }

    // Verifica o estado de autenticação para decidir a View
    if (AppStore.currentUser) {
        // --- UTILIZADOR AUTENTICADO ---
        console.log('Utilizador autenticado. A renderizar DashboardView.');
        updateNavbar(AppStore.currentUser);
        
        // Renderiza o Dashboard real (o elemento DOM retornado pela função)
        appContainer.appendChild(renderDashboardView());

    } else {
        // --- UTILIZADOR NÃO AUTENTICADO ---
        updateNavbar(null);
        console.log('Utilizador não autenticado. A renderizar LoginView.');
        appContainer.appendChild(renderLoginView());
    }
}

// --- 3. Inicialização ---
function initApp() {
    console.log('Aplicação Inicializada.');
    router(); 
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);



export { AppStore, router };