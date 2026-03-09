import ProdutosModels from "../models/ProdutosModels.js";

const tratarErro = (res, error) => {
    console.error("ERRO:", error.message);
    return res.status(400).json({ error: error.message });
};

export const criar = async (req, res) => {
    try {
        const produto = new ProdutosModels(req.body);
        const data = await produto.criar();
        res.status(201).json({ message: "Produto criado!", data });
    } catch (error) {
        tratarErro(res, error);
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutosModels.buscarTodos(req.query);
        res.json({ data: registros });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar produtos." });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await ProdutosModels.buscarPorId(id);
        if (!produto) return res.status(404).json({ error: "Produto não encontrado." });
        res.json({ data: produto });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar produto." });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const produtoExistente = await ProdutosModels.buscarPorId(id);
        if (!produtoExistente) return res.status(404).json({ error: "Produto não encontrado." });

        Object.assign(produtoExistente, req.body);
        const data = await produtoExistente.atualizar();
        res.json({ message: "Atualizado com sucesso!", data });
    } catch (error) {
        tratarErro(res, error);
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await ProdutosModels.buscarPorId(id);
        if (!produto) return res.status(404).json({ error: "Produto não encontrado." });

        await produto.deletar();
        res.json({ message: "Deletado com sucesso!" });
    } catch (error) {
        tratarErro(res, error);
    }
};