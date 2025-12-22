import { renderLoginView } from './views/loginView.js';
import { renderDashboardView } from './views/dashboardView.js';

const AppStore = {
    currentUser: null,
    categories: [], 
    activeCategory: null, 
    viewMode: 'Table' 
};

function updateNavbar(user) {
    const navbar = document.querySelector('.titlebar');
    if (!navbar) return;
    if (user) {
        // --- MODO DASHBOARD (User Logged In) ---
        navbar.innerHTML = `
            <ul id="nav-ul">
                <li class="navtitle">DO-DID</li>
                <li class="navtitle">|</li>
                <li class="navtitle">Bem-vindo, ${user.username}</li>
                <li class="navtitle clickable" id="btn-logout"><u>Logout </u></button></li>
            </ul>
        `;
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                AppStore.currentUser = null;
                AppStore.categories = [];
                AppStore.tasks = [];
                router();
            });
        }

    } else {
        // --- MODO LOGIN ---
        navbar.innerHTML = `
            <ul>
                <li class="navtitle">DO-DID</li>
            </ul>
        `;
    }
}

function router() {
    const appContainer = document.getElementById('app');
    
    if (appContainer) {
        appContainer.innerHTML = '';
    } else {
        return;
    }

    if (AppStore.currentUser) {
        // --- UTILIZADOR AUTENTICADO ---
        updateNavbar(AppStore.currentUser);
        appContainer.appendChild(renderDashboardView());

    } else {
        // --- UTILIZADOR NÃO AUTENTICADO ---
        updateNavbar(null);
        appContainer.appendChild(renderLoginView());
    }
}

// --- 3. Inicialização ---
function initApp() {
    router(); 
}
document.addEventListener('DOMContentLoaded', initApp);
export { AppStore, router };