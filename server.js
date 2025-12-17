/**
 * server.js
 * Backend Node.js com conexão persistente ao MongoDB
 */
const http = require('http');
const { MongoClient } = require('mongodb');

// Configuração
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017'; // Confirma se é esta a porta do teu screen
const DB_NAME = 'do-did';

const client = new MongoClient(MONGO_URL);
let db; // Variável global para guardar a conexão à BD


const server = http.createServer(async (req, res) => {
    // Log para debug
    console.log(`Pedido: ${req.method} ${req.url}`);

    // 1. Preflight (CORS)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 2. Endpoint de LOGIN (Apenas Username)
    // Nota: O URL tem de ser exato. Se o api.js mandar /login, muda aqui para /login
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());

        req.on('end', async () => {
            try {
                const usersCollection = db.collection('user');
                const { username } = JSON.parse(body);

                console.log(` A procurar utilizador: "${username}"`);

                const user = await usersCollection.findOne({ username: username });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                
                if (user) {
                    // Remove a password antes de enviar (segurança básica)
                    const { password, ...safeUser } = user;
                    console.log("Utilizador encontrado!");
                    res.end(JSON.stringify({ success: true, user: safeUser }));
                } else {
                    console.log("Utilizador não existe.");
                    res.end(JSON.stringify({ success: false, message: "Utilizador não encontrado." }));
                }
            } catch (error) {
                console.error("Erro interno:", error);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, message: 'Erro de Servidor' }));
            }
        });
        return;
    }
    if (req.url.startsWith('/api/categories') && req.method === 'GET') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const userId = urlParams.get('userId');

        try {
            // Nota: Usa o nome exato da coleção "categories" (minúscula)
            const categories = await db.collection('categories').find({ userId: userId }).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(categories));
        } catch (error) {
            console.error(error);
            res.writeHead(500); res.end(JSON.stringify({ error: 'Erro ao buscar categorias' }));
        }
        return;
    }

    // --- Rota: Obter TAREFAS do utilizador ---
    // Ex: GET /api/tasks?userId=123
    if (req.url.startsWith('/api/tasks') && req.method === 'GET') {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const userId = urlParams.get('userId');

        try {
            // Nota: Usa o nome exato da coleção "Tasks"
            const tasks = await db.collection('tasks').find({ userId: userId }).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tasks));
        } catch (error) {
            console.error(error);
            res.writeHead(500); res.end(JSON.stringify({ error: 'Erro ao buscar tarefas' }));
        }
        return;
    }

    // 3. Rota não encontrada (O erro que estavas a ver)
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        message: 'Endpoint Desconhecido',
        receivedUrl: req.url,      // Devolve o que recebeu para ajudar a debugar
        receivedMethod: req.method 
    }));
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