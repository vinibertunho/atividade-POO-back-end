import express from 'express';
import 'dotenv/config';
import usuarioRoutes from '../src/routes/usuarioRoute.js';
import pedidosController from '../src/routes/pedidosRoute.js';
import produtosController from '../src/routes/produtosRoute.js';
import itemPedidoController from '../src/routes/itemPedidoRoute.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

// GET /api/cep/:cep
app.get('/api/cep/:cep', async (req, res) => {
    const { cep } = req.params;

    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
        return res.status(404).json({
            success: false,
            message: 'CEP não encontrado no HoloNet 🔍',
        });
    }

    res.json({ success: true, data: dados });
});

// Rotas
app.use('/api', usuarioRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
