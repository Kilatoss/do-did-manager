import { AppStore, router } from "../app.js";
import { ApiService } from "../services/api.js";
import { openCreateAccountModal } from "../components/create-account.js";

export function renderLoginView() {
  const loginView = document.createElement("section");
  loginView.id = "login-view";
  loginView.className = "view-container";

  loginView.innerHTML = `
        <div class="login-card">
            <h1 class="slogan">START <span style="color: var(--red);">DOING</span> WHAT YOU SHOULD'VE <span style="color: var(--accent-color);">DID</span></h1>

            <input type="text" id="username-input" placeholder="Username" autocomplete="username" />

            <div class="action-buttons">
                <button id="btn-signup" class="button-style">Criar Conta</button>
                <button id="btn-login" class="button-style">Entrar</button>
            </div>
            <p id="error-msg" style="color: red; display: none;"></p>
        </div>
    `;

  loginView.querySelector('#btn-signup').addEventListener('click', () => {
      openCreateAccountModal(); 
  });
  const executeLogin = async () => {
    console.log(" Botão clicado ou Enter pressionado!"); // Log para debug

    const usernameInput = loginView.querySelector("#username-input").value;
    const errorMsg = loginView.querySelector("#error-msg");

    // Validação simples
    if (!usernameInput) {
        console.log("Campo vazio");
        return;
    }

    console.log(` A pedir login para: ${usernameInput}`);

    // 1. Chamar a API
    const response = await ApiService.login(usernameInput);

    if (response.success) {
      console.log(" Login com sucesso! A mudar de ecrã...");
      
      // 2. Atualizar o Estado Global
      AppStore.currentUser = response.user;

      // 3. Chamar o Router para mudar de ecrã
      router();
    } else {
      console.log(" Erro no login:", response.message);
      errorMsg.textContent = response.message;
      errorMsg.style.display = "block";
    }
  };

  // --- EVENTO 1: Clique no Botão ---
  const btn = loginView.querySelector("#btn-login");
  btn.addEventListener("click", executeLogin);

  // --- EVENTO 2: Tecla Enter no Input ---
  const input = loginView.querySelector("#username-input");
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      executeLogin(); // Chama a mesma função do botão
    }
  });

  return loginView;
}