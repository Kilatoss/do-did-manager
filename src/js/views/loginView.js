/**
 * src/views/loginView.js
 * * Responsável por renderizar a vista de Login/Registo.
 */

// Importa funções de manipulação de DOM, se existirem (ex: createElement, render)

export function renderLoginView() {
    // Cria o elemento principal da vista
    const loginView = document.createElement('section');
    loginView.id = 'login-view';
    // Aplica classes CSS para estilização (ex: centralização, fundo)
    loginView.classList.add('view-container'); 

    // Conteúdo da Vista
    loginView.innerHTML = `
        <div class="login-card">
            <h1>Bem-vindo(a) ao Task Manager!</h1>
            
            <p class="slogan">
                "Organize o seu CHAOS, liberte a sua mente."
            </p>

            <div class="action-buttons">
                <button id="btn-login" class="primary-button">
                    Entrar (Login)
                </button>
                
                <button id="btn-signup" class="secondary-button">
                    Registar (Sign Up)
                </button>
            </div>
            
            <p class="small-text">
                O seu painel de produtividade a um clique de distância.
            </p>
        </div>
    `;

    // Adiciona event listeners aos botões
    loginView.querySelector('#btn-login').addEventListener('click', handleLoginClick);
    loginView.querySelector('#btn-signup').addEventListener('click', handleSignupClick);

    // Retorna o elemento DOM completo para ser injetado no #app
    return loginView;
}

/**
 * Função placeholder para lidar com o clique no botão de Login.
 * Normalmente abriria um Modal com o formulário de login[cite: 17, 34].
 */
function handleLoginClick() {
    console.log('Login button clicked - Implementar abertura do Modal de Login.');
    // Ex: openModal('login');
}

/**
 * Função placeholder para lidar com o clique no botão de Registo.
 * Normalmente abriria um Modal com o formulário de registo[cite: 17, 34].
 */
function handleSignupClick() {
    console.log('Sign Up button clicked - Implementar abertura do Modal de Registo.');
    // Ex: openModal('signup');
}

// Para uso no app.js:
// const appDiv = document.getElementById('app');
// appDiv.appendChild(renderLoginView());