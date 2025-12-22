export function openTutorial() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-card tutorial-card">
                <h2 class="modal-title tutorial-header-title">Como usar o Do-Did</h2>
                
                <div class="tutorial-content">
                    
                    <div class="tutorial-section">
                        <h3 class="tutorial-subtitle">1. Categorias</h3>
                        <p class="tutorial-text">
                            O seu espaço de trabalho. Crie categorias (ex: "Trabalho", "Casa") para agrupar as suas tarefas. 
                            Clique num cartão para entrar no <strong>Modo de Foco</strong>.
                        </p>
                    </div>

                    <div class="tutorial-section">
                        <h3 class="tutorial-subtitle">2. Tarefas e Prazos</h3>
                        <p class="tutorial-text">
                            As tarefas ordenam-se automaticamente por <strong>Urgência</strong>.
                        </p>
                        <ul class="tutorial-list">
                            <li><strong>Contagem Regressiva:</strong> O prazo muda de cor quando está a acabar (Laranja < 72h, Vermelho < 24h).</li>
                            <li><strong>Sub-tarefas:</strong> Divida objetivos grandes em passos pequenos.</li>
                        </ul>
                    </div>

                    <div class="tutorial-section">
                        <h3 class="tutorial-subtitle">3. Ações Rápidas</h3>
                        <p class="tutorial-text">
                            Na tabela de tarefas, use os botões à direita:
                        </p>
                        <ul class="tutorial-list" style="list-style: none; padding-left: 0;">
                            <li>✎ <strong>Editar:</strong> Altere títulos e adicione sub-tarefas na própria linha.</li>
                            <li>✓ <strong>Concluir:</strong> Marca como feito e move para o histórico.</li>
                            <li>🗑 <strong>Apagar:</strong> Remove a tarefa da lista.</li>
                        </ul>
                    </div>

                </div>

                <div class="tutorial-footer">
                    <button id="btn-close-tutorial" class="button-style">Entendido!</button>
                </div>
            </div>
        </div>
    `;

    const closeModal = () => {
        modalContainer.innerHTML = '';
    };

    modalContainer.querySelector('#btn-close-tutorial').addEventListener('click', closeModal);
    
    modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modalContainer.querySelector('.modal-overlay')) {
            closeModal();
        }
    });
}