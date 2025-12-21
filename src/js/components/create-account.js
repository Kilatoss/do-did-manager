import { ApiService } from '../services/api.js';

export function openCreateAccountModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    // 1. HTML do Modal
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-card">
                <h2 class="modal-title">Criar Conta</h2>
                
                <div class="input-group">
                    <label class="input-label">Username:</label>
                    <input type="text" id="reg-username" placeholder="Seu nome de utilizador">
                </div>
                
                <div class="input-group">
                    <label class="input-label">Email:</label>
                    <input type="email" id="reg-email" placeholder="exemplo@email.com">
                </div>

                <div class="input-group">
                    <label class="input-label">Password:</label>
                    <input type="password" id="reg-password" placeholder="Sua palavra-passe">
                </div>

                <p id="reg-error" style="color: red; display: none; font-size: 0.9rem; margin-bottom: 10px;"></p>

                <div class="modal-actions">
                    <button id="btn-cancel" class="button-style">Cancelar</button>
                    <button id="btn-confirm-create" class="button-style">Criar Conta</button>
                </div>
            </div>
        </div>
    `;

    const closeModal = () => {
        modalContainer.innerHTML = '';
    };

    modalContainer.querySelector('#btn-cancel').addEventListener('click', closeModal);

    modalContainer.querySelector('#btn-confirm-create').addEventListener('click', async () => {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const errorMsg = document.getElementById('reg-error');

        if (!username || !email || !password) {
            errorMsg.textContent = "Por favor, preencha todos os campos.";
            errorMsg.style.display = 'block';
            return;
        }

        const response = await ApiService.register({ username, email, password });

        if (response.success) {
            alert("Conta criada com sucesso! Podes fazer login agora.");
            closeModal();
        } else {
            errorMsg.textContent = response.message;
            errorMsg.style.display = 'block';
        }
    });
}