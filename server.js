const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto")
const fs = require('fs');
const path = require('path');

const PORT = 80;
const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "do-did";

const client = new MongoClient(MONGO_URL);
let db;

const server = http.createServer(async (req, res) => {
  console.log(req.url);
  if (req.url === "/" && req.method === "GET") {
        const filePath = path.join(__dirname, 'public', 'index.html'); 

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end("Erro: index.html não encontrado. Verifica se a pasta se chama 'public'.");
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(content);
            }
        });
        return; 
    }
    if (req.method === "GET" && (req.url.startsWith("/src") || req.url.startsWith("/assets"))) {
        const cleanUrl = req.url.split('?')[0];
        const filePath = path.join(__dirname, cleanUrl);

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.ttf': 'font/ttf'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end("Ficheiro não encontrado");
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content);
            }
        });
        return;
    }
  // 1. Endpoint de LOGIN
  if (req.url === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const usersCollection = db.collection("user");
        const { username, password } = JSON.parse(body);
        const user = await usersCollection.findOne({ username: username });
        res.writeHead(200, { "Content-Type": "application/json" });

        if (!user) {
          res.end(JSON.stringify({ success: false, message: "Utilizador não encontrado." }));
          return;
        }

        if (!user.salt || !user.hash) {
             if (user.password === password) {
                 const { password, ...safeUser } = user;
                 res.end(JSON.stringify({ success: true, user: safeUser }));
                 return;
             }
             res.end(JSON.stringify({ success: false, message: "Formato de conta inválido. Registe-se novamente." }));
             return;
        }

        const derivedKey = crypto.scryptSync(password, user.salt, 64);
        const derivedHash = derivedKey.toString('hex');

        if (derivedHash !== user.hash) {
          res.end(JSON.stringify({ success: false, message: "Password incorreta." }));
        } else {
          const { hash, salt, ...safeUser } = user;
          res.end(JSON.stringify({ success: true, user: safeUser }));
        }

      } catch (error) {
        console.error("Erro interno:", error);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, message: "Erro de Servidor" }));
      }
    });
    return;
  }
  // 2. Endpoint de REGISTO
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
        const salt = crypto.randomBytes(16).toString('hex');

        const derivedKey = crypto.scryptSync(password, salt, 64);
        const hash = derivedKey.toString('hex');

        const newUser = {
          username,
          email,
          salt,
          hash,
          createdAt: new Date(),
        };

        await usersCollection.insertOne(newUser);

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

  // 3. Endpoint de MOSTRAR CATEGORIAS do utilizador ---
  if (req.url.startsWith("/api/categories") && req.method === "GET") {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const userId = urlParams.get("userId");

    try {
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
  // 3.1 Endpoint de CRIAR CATEGORIA ---
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
  // 4. Endpoint de TAREFAS (POST e GET) ---
 if (req.url.startsWith("/api/tasks") && !req.url.includes("/api/tasks/")) {
    if (req.method === "GET") {
        const userId = new URLSearchParams(req.url.split("?")[1]).get("userId");
        const tasks = await db.collection("tasks").find({ userId }).toArray();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(tasks));
        return;
    }
    if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", async () => {
            const data = JSON.parse(body);
            const newTask = { 
                ...data, 
                status: "Pending", 
                createdAt: new Date() 
            };
            const result = await db.collection("tasks").insertOne(newTask);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, task: {...newTask, _id: result.insertedId} }));
        });
        return;
    }
  }
  // 4.1 Endpoint de ATUALIZAR TAREFA (PUT) ---
  if (req.url.startsWith("/api/tasks/") && req.method === "PUT") {
    const taskId = req.url.split("/").pop(); // Pega o ID da URL

    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const updates = JSON.parse(body);
        
        delete updates._id; 

        const result = await db.collection("tasks").updateOne(
            { _id: new ObjectId(taskId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Tarefa não encontrada." }));
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Tarefa atualizada." }));

      } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Erro interno." }));
      }
    });
    return;
  }
  // 5. Rota não encontrada
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
    await client.connect();
    db = client.db(DB_NAME);

    server.listen(PORT, () => {
    });
  } catch (error) {
    console.error(" Erro fatal ao conectar ao MongoDB:", error);
    process.exit(1);
  }
}

startServer();
