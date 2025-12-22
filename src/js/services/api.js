const API_URL = "/api";

export const ApiService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro no registo:", error);
      return {
        success: false,
        message: "Falha na comunicação com o servidor.",
      };
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
  createCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      return { success: false, message: "Erro de comunicação." };
    }
  },
  getTasks: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/tasks?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      return [];
    }
  },
  createTask: async (taskData) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      return { success: false, message: "Erro de comunicação." };
    }
  },
  updateTask: async (taskId, updates) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro no updateTask:", error);
      return { success: false, message: "Erro de comunicação." };
    }
  },
};
