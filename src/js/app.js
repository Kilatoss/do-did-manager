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
        navbar.innerHTML = `
            <ul>
                <li class="navtitle">DO-DID</li>
                <li class="navtitle">|</li>
                <li class="navtitle">Bem-vindo, ${user.username}</li>
                <li class="navtitle red clickable" id="btn-logout"><u>Logout </u></button></li>
            </ul>
        `;
        // --- LÓGICA DE LOGOUT ---
        // Adicionamos o evento ao botão que acabámos de criar
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                console.log("A terminar sessão...");
                
                AppStore.currentUser = null;
                
                AppStore.categories = [];
                AppStore.tasks = [];

                router();
            });
        }

    } else {
        // --- MODO LOGIN (Padrão) ---
        navbar.innerHTML = `
            <ul>
                <li class="navtitle">DO-DID</li>
            </ul>
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