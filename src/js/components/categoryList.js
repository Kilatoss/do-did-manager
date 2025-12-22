import { renderTaskList } from './taskList.js';
import { openCreateTaskModal } from './create-task.js';
import { AppStore } from '../app.js';

export const CategoryList = {
    render: (categories, tasks, activeCategoryId, onCategorySelect, onClose) => {
        const container = document.createElement('div');
        container.className = 'category-view-container';

        // --- MODO 1: FOCUS (Uma aberta, resto na direita) ---
        if (activeCategoryId) {
            container.classList.add('mode-focus');
            
            // 1. Encontrar categoria ativa e as restantes
            const activeCategory = categories.find(c => c._id === activeCategoryId);
            const otherCategories = categories.filter(c => c._id !== activeCategoryId);
            
            // Filtrar tarefas da categoria ativa
            const activeTasks = tasks.filter(t => t.categoryId === activeCategoryId);

            // A. COLUNA ESQUERDA (HERO - Aberta)
            const heroCard = document.createElement('div');
            heroCard.className = 'category-card is-open fade-in';
            heroCard.style.borderTopColor = activeCategory.color;

            heroCard.style.setProperty('--theme-color', activeCategory.color);

            heroCard.innerHTML = `
                <span class="close-category-btn">✕</span>
                <div class="header">
                        <div>
                            <h2 style="color:${activeCategory.color}">${activeCategory.name}</h2>
                            <p>${activeCategory.description || 'Sem descrição'}</p>
                        </div>
                        <button id="btn-create-task-hero" class="button-style btn-create-task">
                            + Nova Tarefa
                        </button>
                </div>
                <div class="tasks-content"></div>
            `;
            const renderTable = () => {
                const contentDiv = heroCard.querySelector('.tasks-content');
                contentDiv.innerHTML = ''; 
                const taskTable = renderTaskList(activeTasks);
                contentDiv.appendChild(taskTable);
            };

            const taskTable = renderTaskList(activeTasks);
            heroCard.querySelector('.tasks-content').appendChild(taskTable);

            const btnCreate = heroCard.querySelector('#btn-create-task-hero');
            btnCreate.addEventListener('click', () => {
                openCreateTaskModal(activeCategory._id, (newTask) => {
                    AppStore.tasks.push(newTask);
                    activeTasks.push(newTask);
                    renderTable();
                });
            });

            heroCard.querySelector('.close-category-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                onClose();
            });

            container.appendChild(heroCard);

            // B. COLUNA DIREITA (SIDEBAR - Mini Grid)
            const sidebar = document.createElement('div');
            sidebar.className = 'mini-grid-sidebar fade-in';

            otherCategories.forEach(cat => {
                const card = createSimpleCard(cat, tasks, onCategorySelect);
                sidebar.appendChild(card);
            });

            container.appendChild(sidebar);

        } 
        // --- MODO 2: OVERVIEW (Grid 3xN) ---
        else {
            container.classList.add('mode-overview');

            if (categories.length === 0) {
                container.innerHTML = '<p>Nenhuma categoria encontrada.</p>';
                return container;
            }

            categories.forEach(cat => {
                const card = createSimpleCard(cat, tasks, onCategorySelect);
                container.appendChild(card);
            });
        }

        return container;
    }
};

function createSimpleCard(category, allTasks, onClick) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.style.borderTopColor = category.color;

    const pendingCount = allTasks.filter(t => 
        t.categoryId === category._id && t.status === 'Pending'
    ).length;

    card.innerHTML = `
        <h3 style="color: ${category.color}">${category.name}</h3>
        <p style="font-size: 0.9rem; color: #666;">${category.description || ''}</p>
        <div style="margin-top: -15px; ">
            <span style="background: var(--secondary-color); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                <strong>${pendingCount}</strong> pendentes
            </span>
        </div>
    `;

    card.addEventListener('click', () => onClick(category._id));

    return card;
}