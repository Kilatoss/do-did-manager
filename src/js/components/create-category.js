import { ApiService } from '../services/api.js';
import { AppStore } from '../app.js';

// Paleta de 12 cores harmoniosas
const COLORS = [
    '#E74C3C', // Vermelho Suave
    '#E67E22', // Laranja
    '#F1C40F', // Amarelo Girassol
    '#2ECC71', // Esmeralda
    '#16A085', // Verde Mar
    '#3498DB', // Azul (diferente do background)
    '#9B59B6', // Ametista
    '#8E44AD', // Roxo Profundo
    '#34495E', // Azul acinzentado escuro
    '#E91E63', // Rosa
    '#1ABC9C', // Turquesa
    '#95A5A6'  // Cinza Neutro
];

export function openCreateCategoryModal(onSuccessCallback) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    // 1. Gerar HTML das Cores
    const colorOptionsHTML = COLORS.map((color, index) => `
        <div class="color-option ${index === 0 ? 'selected' : ''}" 
             style="background-color: ${color};" 
             data-color="${color}">
             ${index === 0 ? '✓' : ''}
        </div>
    `).join('');

    // 2. Injetar HTML do Modal
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-card">
                <h2>Nova Categoria</h2>
                <p>Crie um espaço para organizar as suas tarefas.</p>
                
                <div class="input-group">
                    <label>Título</label>
                    <input type="text" id="cat-name" placeholder="Ex: Trabalho, Estudos...">
                </div>
                
                <div class="input-group">
                    <label>Descrição</label>
                    <input type="text" id="cat-desc" placeholder="Opcional">
                </div>

                <div class="input-group">
                    <label>Cor de Destaque</label>
                    <div class="color-grid">
                        ${colorOptionsHTML}
                    </div>
                </div>

                <p id="cat-error" style="color: red; display: none; font-size: 0.9rem; margin-top: 10px;"></p>

                <div class="modal-actions">
                    <button id="btn-cancel-cat" class="button-style">Cancelar</button>
                    <button id="btn-confirm-cat" class="button-style">Criar</button>
                </div>
            </div>
        </div>
    `;

    // Variável para guardar a cor selecionada (começa com a primeira)
    let selectedColor = COLORS[0];

    // 3. Lógica de Seleção de Cor
    const colorDivs = modalContainer.querySelectorAll('.color-option');
    colorDivs.forEach(div => {
        div.addEventListener('click', () => {
            // Remove seleção anterior
            colorDivs.forEach(d => {
                d.classList.remove('selected');
                d.innerHTML = '';
            });
            // Adiciona nova seleção
            div.classList.add('selected');
            div.innerHTML = '✓'; // Marca visual
            selectedColor = div.dataset.color;
        });
    });

    // 4. Fechar Modal
    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#btn-cancel-cat').addEventListener('click', closeModal);

    // 5. Confirmar Criação
    modalContainer.querySelector('#btn-confirm-cat').addEventListener('click', async () => {
        const name = document.getElementById('cat-name').value;
        const description = document.getElementById('cat-desc').value;
        const errorMsg = document.getElementById('cat-error');

        if (!name) {
            errorMsg.textContent = "O título é obrigatório.";
            errorMsg.style.display = 'block';
            return;
        }

        const payload = {
            userId: AppStore.currentUser._id, // Associa ao user logado
            name,
            description,
            color: selectedColor
        };

        const response = await ApiService.createCategory(payload);

        if (response.success) {
            closeModal();
            // Executa o callback para atualizar a UI (adicionar o cartão novo)
            if (onSuccessCallback) onSuccessCallback(response.category);
        } else {
            errorMsg.textContent = response.message || "Erro ao criar.";
            errorMsg.style.display = 'block';
        }
    });
}