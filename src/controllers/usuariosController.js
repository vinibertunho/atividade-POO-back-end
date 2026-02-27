import UsuarioModel from '../models/UsuarioModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        if (!telefone) return res.status(400).json({ error: 'O campo "telefone" é obrigatório!' });
        if (!email) return res.status(400).json({ error: 'O campo "email" é obrigatório!' });
        if (!cpf || !cpf.length <= 11) return res.status(400).json({ error: 'O campo "cpf" é obrigatório! E deve conter 11 digitos' });
        if (!cep || !cep.length == 8) return res.status(400).json({ error: 'O campo "cep" é obrigatório! E deve conter 8 digitos' });


        const usuario = new UsuarioModel({ nome, telefone, email, cpf, cep });
        const data = await usuario.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await UsuarioModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const usuario = await UsuarioModel.buscarPorId(parseInt(id));

        if (!usuario) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: usuario });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const usuario = await UsuarioModel.buscarPorId(parseInt(id));

        if (!usuario) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) usuario.nome = req.body.nome;
        if (req.body.telefone !== undefined) usuario.telefone = req.body.telefone;
        if (req.body.email !== undefined) usuario.email = req.body.email;
        if (req.body.cpf !== undefined) usuario.cpf = req.body.cpf;
        if (req.body.cep !== undefined) usuario.cep = req.body.cep;


        const data = await usuario.atualizar();

        res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const usuario = await UsuarioModel.buscarPorId(parseInt(id));

        if (!usuario) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }
        if (!usuario.pedido.status == "ABERTO") {
            return res.status(404).json({ error: 'Não é possível deletar usuário quando tem um pedido em aberto.' });
        }

        await usuario.deletar();

        res.json({ message: `O registro "${usuario.nome}" foi deletado com sucesso!`, deletado: usuario });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
