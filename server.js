const http = require("http");
const { MongoClient } = require("mongodb");

// Configuração
const PORT = 3000;
const MONGO_URL = "mongodb://localhost:27017"; // Confirma se é esta a porta do teu screen
const DB_NAME = "do-did";

const client = new MongoClient(MONGO_URL);
let db; // Variável global para guardar a conexão à BD

const server = http.createServer(async (req, res) => {
  // Log para debug
  console.log(`Pedido: ${req.method} ${req.url}`);

  // 2. Endpoint de LOGIN (Apenas Username)
  if (req.url === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const usersCollection = db.collection("user");
        const { username } = JSON.parse(body);

        console.log(` A procurar utilizador: "${username}"`);

        const user = await usersCollection.findOne({ username: username });

        res.writeHead(200, { "Content-Type": "application/json" });

        if (user) {
          // Remove a password antes de enviar (segurança básica)
          const { password, ...safeUser } = user;
          console.log("Utilizador encontrado!");
          res.end(JSON.stringify({ success: true, user: safeUser }));
        } else {
          console.log("Utilizador não existe.");
          res.end(
            JSON.stringify({
              success: false,
              message: "Utilizador não encontrado.",
            })
          );
        }
      } catch (error) {
        console.error("Erro interno:", error);
        res.writeHead(500);
        res.end(
          JSON.stringify({ success: false, message: "Erro de Servidor" })
        );
      }
    });
    return;
  }
  // 3. Endpoint de REGISTO
  if (req.url === "/api/register" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        let collectionName = "user";

        const usersCollection = db.collection(collectionName);
        const { username, email, password } = JSON.parse(body);

        // Verificar se já existe
        const existingUser = await usersCollection.findOne({ username });
        const existingEmail = await usersCollection.findOne({ email });
        if (existingUser) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: "Este nome de utilizador já existe.",
            })
          );
          return;
        }
        if (existingEmail) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: "Este email já está registado.",
            })
          );
          return;
        }

        // Criar o novo objeto User
        const newUser = {
          username,
          email,
          password, // Nota: Em produção real, deverias usar hash/encriptação
          createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Conta criada com sucesso!",
          })
        );
      } catch (error) {
        console.error("Erro no registo:", error);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            success: false,
            message: "Erro interno ao criar conta.",
          })
        );
      }
    });
    return;
  }

  // 4. Endpoint de MOSTRAR CATEGORIAS do utilizador ---
  if (req.url.startsWith("/api/categories") && req.method === "GET") {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const userId = urlParams.get("userId");

    try {
      // Nota: Usa o nome exato da coleção "categories" (minúscula)
      const categories = await db
        .collection("categories")
        .find({ userId: userId })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(categories));
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Erro ao buscar categorias" }));
    }
    return;
  }
  // 4.1 Endpoint de CRIAR CATEGORIA ---
  if (req.url === "/api/categories" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const { userId, name, description, color } = JSON.parse(body);

        if (!userId || !name) {
          res.writeHead(400);
          res.end(
            JSON.stringify({ success: false, message: "Dados incompletos." })
          );
          return;
        }

        const newCategory = {
          name,
          userId: userId,
          description,
          color,
          createdAt: new Date(),
        };

        const result = await db.collection("categories").insertOne(newCategory);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            category: { ...newCategory, _id: result.insertedId },
          })
        );
      } catch (error) {
        console.error("Erro ao criar categoria:", error);
        res.writeHead(500);
        res.end(
          JSON.stringify({ success: false, message: "Erro de servidor." })
        );
      }
    });
    return;
  }
  // 5. Endpoint de TAREFAS do utilizador ---
  if (req.url.startsWith("/api/tasks") && req.method === "GET") {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const userId = urlParams.get("userId");

    try {
      const tasks = await db
        .collection("tasks")
        .find({ userId: userId })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(tasks));
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Erro ao buscar tarefas" }));
    }
    return;
  }
  // 5.1 Endpoint de CRIAR TAREFA
  if (req.url === "/api/tasks" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const taskData = JSON.parse(body);

        // Validação básica
        if (!taskData.userId || !taskData.categoryId || !taskData.title) {
          res.writeHead(400);
          res.end(
            JSON.stringify({ success: false, message: "Dados incompletos." })
          );
          return;
        }

        const newTask = {
          ...taskData,
          status: "Pending", // Estado inicial padrão
          createdAt: new Date(),
        };

        const result = await db.collection("tasks").insertOne(newTask);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            task: { ...newTask, _id: result.insertedId },
          })
        );
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        res.writeHead(500);
        res.end(
          JSON.stringify({ success: false, message: "Erro de servidor." })
        );
      }
    });
    return;
  }
  // 6. Rota não encontrada
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Endpoint Desconhecido",
      receivedUrl: req.url,
      receivedMethod: req.method,
    })
  );
});

// --- Inicialização ---
async function startServer() {
  try {
    console.log(" A tentar conectar ao MongoDB...");
    // 1. Conecta ao Mongo
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Conectado ao MongoDB com sucesso!");

    // 2. Inicia o Servidor HTTP
    server.listen(PORT, () => {
      console.log(` Servidor Backend a correr em http://localhost:${PORT}`);
      console.log(` (Pressiona Ctrl+C para parar)`);
    });
  } catch (error) {
    console.error(" Erro fatal ao conectar ao MongoDB:", error);
    process.exit(1); // Encerra se não conseguir ligar à BD
  }
}

startServer();
