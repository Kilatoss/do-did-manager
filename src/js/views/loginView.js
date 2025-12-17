import { AppStore, router } from "../app.js"; // Importar Store e Router
import { ApiService } from "../services/api.js";

export function renderLoginView() {
  const loginView = document.createElement("section");
  loginView.id = "login-view";
  loginView.className = "view-container";

  loginView.innerHTML = `
        <div class="login-card">
            <h1>Bem-vindo(a)</h1>
            <p class="slogan">"Organize o seu caos, liberte a sua mente."</p>

            <div class="input-group">
                <input type="text" id="username-input" placeholder="Nome de utilizador (ex: admin)" />
            </div>

            <div class="action-buttons">
                <button id="btn-login" class="primary-button">Entrar</button>
            </div>
            <p id="error-msg" style="color: red; display: none;"></p>
        </div>
    `;

  const executeLogin = async () => {
    console.log("🖱️ Botão clicado ou Enter pressionado!"); // Log para debug

    const usernameInput = loginView.querySelector("#username-input").value;
    const errorMsg = loginView.querySelector("#error-msg");

    // Validação simples
    if (!usernameInput) {
        console.log("⚠️ Campo vazio");
        return;
    }

    console.log(`📡 A pedir login para: ${usernameInput}`);

    // 1. Chamar a API
    const response = await ApiService.login(usernameInput);

    if (response.success) {
      console.log("✅ Login com sucesso! A mudar de ecrã...");
      
      // 2. Atualizar o Estado Global
      AppStore.currentUser = response.user;

      // 3. Chamar o Router para mudar de ecrã
      router();
    } else {
      console.log("❌ Erro no login:", response.message);
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