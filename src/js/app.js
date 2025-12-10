/**
 * src/js/app.js
 * Ponto de entrada da aplicação. Responsável pela inicialização e pelo Router.
 */

// Importa as Vistas
import { renderLoginView } from './views/loginView.js';
// Em desenvolvimento (será necessário criar):
// import { renderDashboardView } from '../views/dashboardView.js'; 

// --- 1. Gestão de Estado (Store Simples) ---

/**
 * Objeto global para guardar o estado da aplicação.
 * Simula a Store para evitar pedidos excessivos ao backend.
 */
const AppStore = {
    // Simula o usuário autenticado (null se não autenticado)
    currentUser: null, // Mudar para um objeto { name: 'Utilizador', id: 1 } para simular login
    categories: [], // Lista de categorias
    activeCategory: null, // Categoria atualmente selecionada
    viewMode: 'Table' // 'Table' ou 'Timeline'
};

// --- 2. Router Simples ---

/**
 * Função principal do Router. Decide qual View renderizar.
 */
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
        // Se autenticado, renderiza o Dashboard (Visão principal)
        console.log('Utilizador autenticado. A renderizar DashboardView.');
        // **TODO: Descomentar após criar dashboardView.js**
        // appContainer.appendChild(renderDashboardView()); 

        // Por enquanto, vamos mostrar um placeholder para testar o router
        const dashboardPlaceholder = document.createElement('h1');
        dashboardPlaceholder.textContent = `Bem-vindo(a), ${AppStore.currentUser.name}! (Dashboard)`;
        appContainer.appendChild(dashboardPlaceholder);

    } else {
        // Se não autenticado, renderiza o Ecrã de Login/Registo
        console.log('Utilizador não autenticado. A renderizar LoginView.');
        appContainer.appendChild(renderLoginView());
    }
}

// --- 3. Inicialização da Aplicação ---

/**
 * Função de inicialização da App. 
 * Executada quando o DOM estiver completamente carregado.
 */
function initApp() {
    console.log('Aplicação Inicializada.');
    
    // Inicializa o Router para renderizar a primeira View
    router(); 
    
    // **NOTA DE TESTE:**
    // Para testar o Dashboard, descomente e recarregue a página:
    // AppStore.currentUser = { name: 'João Silva', id: 1 };
    // router();
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);

// Exporta o estado e o router (se necessário para outros módulos)
export { AppStore, router };