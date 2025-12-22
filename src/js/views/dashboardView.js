import { AppStore } from "../app.js";
import { ApiService } from "../services/api.js";
import { CategoryList } from "../components/categoryList.js";
import { openCreateCategoryModal } from '../components/create-category.js';
import { openTutorial } from '../components/tutorial.js';

export function renderDashboardView() {
  const dashboard = document.createElement("div");
  dashboard.id = "dashboard-view";
  dashboard.className = "dashboard-layout";

  const user = AppStore.currentUser;
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
            <button id="btn-tutorial" class="button-style secondary">? Ajuda</button>
            <button id="btn-add-task" class="button-style">+ Criar Categoria</button>
        </div>
    `;
  const btnAdd = actionBar.querySelector("#btn-add-task");
  const btnTutorial = actionBar.querySelector("#btn-tutorial");
  btnTutorial.addEventListener("click", () => {
      openTutorial();
  });

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
      AppStore.activeCategory,


      (selectedId) => {
        AppStore.activeCategory = selectedId;
        updateView();
      },
      () => {
        AppStore.activeCategory = null;
        updateView();
      }
    );

    contentArea.appendChild(component);
  };

  loadData(user._id).then(() => {
    updateView();
  });

  return dashboard;
}
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
