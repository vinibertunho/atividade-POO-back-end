import UsuarioModel from '../models/UsuarioModel.js';



export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }
      

        const usuario = new UsuarioModel({
            nome,
            telefone,
            email,
            cpf,
            cep: cep ? String(cep) : null,
            logradouro: endereco.logradouro || null,
            bairro: endereco.bairro || null,
            cidade: endereco.localidade || null,
            uf: endereco.uf || null,
        });
        const data = await usuario.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || '';
            if (target.includes('email')) {
                return res
                    .status(400)
                    .json({ error: 'Este e-mail já está em uso por outro usuário.' });
            }
            if (target.includes('cpf')) {
                return res.status(400).json({ error: 'Este CPF já está cadastrado no sistema.' });
            }
        }
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
        if (usuario.pedidos?.[0]?.status === "ABERTO") {
            return res
                .status(404)
                .json({ error: 'Não é possível deletar usuário quando tem um pedido em aberto.' });
        }

        await usuario.deletar();

        res.json({ message: `O registro "${usuario.nome}" foi deletado com sucesso!`, deletado: usuario });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
