import { AppStore } from '../app.js';
import { ApiService } from '../services/api.js'; // Importar API
import { renderTaskList } from '../components/taskList.js';

export function renderDashboardView() {
    const dashboard = document.createElement('div');
    dashboard.id = 'dashboard-view';
    dashboard.className = 'dashboard-layout';

    const user = AppStore.currentUser;

    // --- A. Sidebar ---
    const avatarHTML = user.avatar 
        ? `<img src="${user.avatar}" alt="Avatar">` 
        : `<div class="avatar-placeholder">${user.username.charAt(0).toUpperCase()}</div>`;

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="user-profile">
            <div class="avatar-circle">${avatarHTML}</div>
        </div>
        <nav>
            <input type="text" placeholder="Pesquisar..." class="search-input">
            <ul>
                <li class="active">Dashboard</li>
                <li>Tarefas</li>
            </ul>
        </nav>
    `;

    // --- B. Área Principal ---
    const mainContent = document.createElement('main');
    mainContent.className = 'main-content';

    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';
    actionBar.innerHTML = `
        <h2 id="page-title">As minhas Categorias</h2>
        <div class="actions">
            <button id="btn-back" class="secondary-button" style="display:none;">← Voltar</button>
            <button id="view-table">Tabela</button>
            <button id="view-timeline">Timeline</button>
            <button id="btn-add-task" class="primary-button">+</button>
        </div>
    `;

    // Contentor da Grid (Começa com Loading)
    const contentContainer = document.createElement('div');
    contentContainer.id = 'content-area';
    contentContainer.className = 'content-area';
    contentContainer.innerHTML = '<p class="loading-msg">A carregar dados...</p>';

    mainContent.appendChild(actionBar);
    mainContent.appendChild(contentContainer);
    dashboard.appendChild(sidebar);
    dashboard.appendChild(mainContent);

    actionBar.querySelector('#btn-back').addEventListener('click', () => {
        // Redesenha a Grid usando os dados que já temos em memória (Store)
        renderCategoryGrid(AppStore.categories, AppStore.tasks, contentContainer, actionBar);
    });
    // Iniciar carregamento
    loadData(user._id, contentContainer, actionBar);

    return dashboard;
}

function renderCategoryGrid(categories, tasks, container, actionBar) {
    // 1. Resetar título e botão
    actionBar.querySelector('#page-title').textContent = 'As minhas Categorias';
    actionBar.querySelector('#btn-back').style.display = 'none';
    
    container.innerHTML = '';
    container.className = 'category-grid'; // Volta ao layout de grid

    categories.forEach(category => {
        const pendingCount = tasks.filter(t => 
            t.categoryId === category._id && t.status === 'Pending'
        ).length;

        const card = document.createElement('div');
        card.className = 'card category-card';
        card.style.borderTop = `4px solid ${category.color || '#ccc'}`;
        
        card.innerHTML = `
            <span class="icon" style="color: ${category.color}">📂</span>
            <h3>${category.name}</h3>
            <p><strong>${pendingCount}</strong> Tarefas Pendentes</p>
        `;

        // --- CLIQUE NO CARTÃO ---
        card.addEventListener('click', () => {
            console.log(`Clicou na categoria: ${category.name}`);
            AppStore.activeCategory = category._id;

            // Filtra as tarefas desta categoria
            const filteredTasks = tasks.filter(t => t.categoryId === category._id);

            // Chama a função que troca a vista para a Tabela
            renderTaskView(category.name, filteredTasks, container, actionBar);
        });

        container.appendChild(card);
    });
}

// --- FUNÇÃO PARA DESENHAR A LISTA DE TAREFAS ---
function renderTaskView(categoryName, tasks, container, actionBar) {
    // 1. Atualizar Título e mostrar botão Voltar
    actionBar.querySelector('#page-title').textContent = `Tarefas: ${categoryName}`;
    actionBar.querySelector('#btn-back').style.display = 'inline-block';

    // 2. Limpar contentor e mudar classe para lista
    container.innerHTML = '';
    container.className = 'task-view-container'; // Classe diferente se necessário no CSS

    // 3. Renderizar o componente de Tabela
    const taskListElement = renderTaskList(tasks);
    container.appendChild(taskListElement);
}

// Função auxiliar para buscar e renderizar os dados
async function loadData(userId, container, actionBar) {
    try {
        const [categories, tasks] = await Promise.all([
            ApiService.getCategories(userId),
            ApiService.getTasks(userId)
        ]);

        // GUARDAR NO STORE GLOBAL [cite: 37]
        AppStore.categories = categories;
        AppStore.tasks = tasks; // <--- Importante: Agora temos as tarefas guardadas

        if (categories.length === 0) {
            container.innerHTML = '<p>Sem categorias.</p>';
            return;
        }

        // Renderiza a Grid Inicial
        renderCategoryGrid(categories, tasks, container, actionBar);

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Erro ao carregar.</p>';
    }
}

// Helper simples para emojis baseado no nome do ícone (opcional)
function getIconEmoji(iconName) {
    const map = {
        'briefcase-outline': '💼',
        'home-outline': '🏠',
        'book-outline': '📚',
        'fitness-outline': '💪'
    };
    return map[iconName] || '📂';
}