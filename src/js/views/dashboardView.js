import { AppStore } from "../app.js";
import { ApiService } from "../services/api.js";
import { CategoryList } from "../components/categoryList.js";
import { openCreateCategoryModal } from '../components/create-category.js';

export function renderDashboardView() {
  const dashboard = document.createElement("div");
  dashboard.id = "dashboard-view";
  dashboard.className = "dashboard-layout";

  const user = AppStore.currentUser;
  // --- B. Área Principal ---
  const mainContent = document.createElement("main");
  mainContent.className = "main-content";

  const contentArea = document.createElement("div");
  contentArea.id = "dynamic-content";
  contentArea.innerHTML = '<p class="loading-msg">A carregar...</p>';

  const actionBar = document.createElement("div");
  actionBar.className = "action-bar";
  actionBar.innerHTML = `
        <h2 id="page-title" class="title">As minhas Categorias</h2>
        <div class="actions">
            <button id="btn-back" class="button-style" style="display:none;">← Voltar</button>
            <button class="button-style" id="view-table">Tabela</button>
            <button class="button-style" id="view-timeline">Timeline</button>
            <button id="btn-add-task" class="button-style">+ Criar Categoria</button>
        </div>
    `;
  const btnAdd = actionBar.querySelector("#btn-add-task");

  btnAdd.addEventListener("click", () => {
      openCreateCategoryModal((newCategory) => {
        AppStore.categories.push(newCategory);
        updateView();
      });
  });

  mainContent.appendChild(actionBar);
  mainContent.appendChild(contentArea);
  dashboard.appendChild(mainContent);

  const updateView = () => {
    contentArea.innerHTML = "";

    const component = CategoryList.render(
      AppStore.categories,
      AppStore.tasks,
      AppStore.activeCategory, // O estado decide o layout! [cite: 37]

      // Callback: Ao clicar numa categoria
      (selectedId) => {
        AppStore.activeCategory = selectedId;
        updateView(); // Redesenha (muda para Focus Mode)
      },

      // Callback: Ao clicar no X
      () => {
        AppStore.activeCategory = null;
        updateView(); // Redesenha (muda para Overview Mode)
      }
    );

    contentArea.appendChild(component);
  };

  // Carregar Dados Iniciais
  loadData(user._id).then(() => {
    updateView();
  });

  return dashboard;
}

// Função auxiliar para buscar e renderizar os dados
async function loadData(userId) {
  try {
    const [categories, tasks] = await Promise.all([
      ApiService.getCategories(userId),
      ApiService.getTasks(userId),
    ]);
    AppStore.categories = categories;
    AppStore.tasks = tasks;
  } catch (err) {
    console.error(err);
  }
}
