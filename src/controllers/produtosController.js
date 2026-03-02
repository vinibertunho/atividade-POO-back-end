import ProdutosModels from '../models/ProdutosModels.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, descricao, categoria, preco, disponivel, itens } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!', data: null});

        if (preco <= 0)
            return res.status(400).json({ message: 'O campo "preco" é obrigatório!', data: null});

        const produtos = new ProdutosModels({
            nome,
            descricao,
            categoria,
            preco: parseFloat(preco),
            disponivel: disponivel === 'true',
            itens
        });
        const data = await produtos.criar();

        res.status(201).json({
            message: 'Produto criado com sucesso!',
            data
        });

    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutosModels.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        res.json({
            message: 'Produtos encontrados com sucesso.',
            data: registros
        })
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const produto = await ProdutosModels.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({
            message: 'Produto encontrado com sucesso.',
            data: produto
        });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar produto.', data: null });
    }
};


export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido.' , data: null});
        }

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!', data: null });
        }

        const produto = await ProdutosModels.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado para atualizar.', data: null });
        }

        if (req.body.nome !== undefined)produto.nome = req.body.nome;
        if (req.body.descricao !== undefined) produto.descricao = req.body.descricao;
        if (req.body.categoria !== undefined) produto.categoria = req.body.categoria;
        if (req.body.preco !== undefined) {
            const preco = parseFloat(req.body.preco);
            if (preco <= 0) return res.status(400).json({ message: 'O campo "preço" deve ser maior que zero' });

            produto.preco = preco;
        }

        if (req.body.disponivel !== undefined) {
            produto.disponivel = req.body.disponivel === true || req.body.disponivel === 'true';
        }
        if (req.body.itens !== undefined) produto.itens = req.body.itens;


        const data = await produto.atualizar();

        res.json({
            message: `Produto ${data.nome} atualizado com sucesso`,
            data
        });

    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido.', data: null });
    }
        const produto = await ProdutosModels.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.', data: null });
        }

        await produto.deletar();

        res.json({
            message: `O registro "${produto.nome}" foi deletado com sucesso!`,
            data: produto
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.', data: null});
    }
};
