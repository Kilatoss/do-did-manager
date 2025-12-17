/**
 * src/js/services/api.js
 * Responsável pela comunicação com o Backend (server.js)
 */

const API_URL = "http://localhost:3000/api"; // Endereço do nosso servidor Node

export const ApiService = {
  /**
   * Tenta fazer login ou registo automático
   * @param {string} username
   */
  login: async (username) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }), // Envia apenas { username: "..." }
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro de API:", error);
      return { success: false, message: "Servidor indisponível." };
    }
  },
  getCategories: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/categories?userId=${userId}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            return [];
        }
    },

    // Buscar Tarefas
    getTasks: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/tasks?userId=${userId}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            return [];
        }
    }

  // Futuramente adicionarás aqui: getTasks, createTask, etc.
};
