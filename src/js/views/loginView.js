import { AppStore, router } from "../app.js";
import { ApiService } from "../services/api.js";
import { openCreateAccountModal } from "../components/create-account.js";

export function renderLoginView() {
  const container = document.createElement("div");
  container.className = "view-container";
  
  container.innerHTML = `
    <div id="scroll-container" class="login-scroll-container">
        
        <section id="login-section" class="full-page-section login-section">
            <div class="login-card">
                <h1 class="app-title">DO-DID MANAGER</h1>
                <h2 class="slogan">START <span style="color: var(--red);">DOING</span> WHAT <br> YOU SHOULD'VE <span style="color: var(--accent-color);">DID</span></h2>

                <input type="text" id="username-input" placeholder="Nome de Usuário" autocomplete="username" /> <br/>
                <input type="password" id="password-input" placeholder="Palavra-Passe" autocomplete="current-password" />

                <div class="action-buttons">
                    <button id="btn-login" class="button-style">Entrar</button>
                    <button id="btn-signup" class="button-style secondary">Criar Conta</button>
                </div>
                <p id="error-msg" style="color: red; display: none; margin-top:10px;"></p>
            </div>
            
            <button id="go-to-about" class="scroll-nav-btn">
                Sobre o Projeto ↓
            </button>
        </section>

        <section id="about-section" class="full-page-section about-section-styled">
            
            <button id="back-to-login" class="scroll-nav-btn up">
                ↑ Voltar ao Login
            </button>

            <div class="about-header">
                <h3 class="about-title">Gestão Inteligente</h3>
                <p>O DO-DID Manager não é apenas mais uma lista de tarefas. É o teu companheiro académico e profissional para transformar a procrastinação em produtividade.</p>
            </div>

            <div class="about-grid">
                <div class="feature-card">
                    <span class="feature-icon">📂</span>
                    <h4 class="feature-title">Organização</h4>
                    <p>Cria categorias personalizadas com cores únicas para separar a vida pessoal da profissional.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🔥</span>
                    <h4 class="feature-title">Urgência</h4>
                    <p>Sistema visual de prioridades. Foca no que é realmente importante com indicadores de cor.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🚀</span>
                    <h4 class="feature-title">Foco</h4>
                    <p>Modo "Focus" para trabalhar numa categoria de cada vez sem distrações visuais.</p>
                </div>
            </div>
        </section>
    </div>
  `;

  const scrollContainer = container.querySelector("#scroll-container");
  const loginSection = container.querySelector("#login-section");
  const aboutSection = container.querySelector("#about-section");

  // 1. Botões de Navegação
  container.querySelector("#go-to-about").addEventListener("click", () => {
    aboutSection.scrollIntoView({ behavior: "smooth" });
  });

  container.querySelector("#back-to-login").addEventListener("click", () => {
    loginSection.scrollIntoView({ behavior: "smooth" });
  });

  // 2. Navegação por Teclado
  const handleKeyScroll = (e) => {
    if (document.activeElement.tagName === "INPUT") return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        aboutSection.scrollIntoView({ behavior: "smooth" });
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        loginSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  document.addEventListener("keydown", handleKeyScroll);

  container.querySelector("#btn-signup").addEventListener("click", () => {
    openCreateAccountModal();
  });

  const executeLogin = async () => {
    const usernameInput = container.querySelector("#username-input").value;
    const passwordInput = container.querySelector("#password-input").value;
    const errorMsg = container.querySelector("#error-msg");

    if (!usernameInput || !passwordInput) {
      errorMsg.textContent = "Por favor, preencha ambos os campos.";
      errorMsg.style.display = "block";
      return;
    }

    const response = await ApiService.login(usernameInput, passwordInput);

    if (response.success) {
      // Remover listener de scroll antes de sair
      document.removeEventListener("keydown", handleKeyScroll); 
      
      AppStore.currentUser = response.user;
      router();
    } else {
      errorMsg.textContent = response.message;
      errorMsg.style.display = "block";
    }
  };

  container.querySelector("#btn-login").addEventListener("click", executeLogin);
  container.querySelector("#username-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeLogin();
  });
  container.querySelector("#password-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeLogin();
  });

  return container;
}
