import ProdutosModels from "../models/ProdutosModels.js";

export const criar = async (req, res) => {
  try {
    const { nome, descricao, categoria, preco, disponivel } = req.body;

    if (!nome || !preco || !categoria) {
      return res
        .status(400)
        .json({ error: "Nome, preço e categoria são obrigatórios!" });
    }

    const produto = new ProdutosModels({
      nome,
      descricao,
      categoria,
      preco: parseFloat(preco),
      disponivel: disponivel === true || disponivel === "true",
    });

    const data = await produto.criar();

    res.status(201).json({
      message: "Produto criado com sucesso!",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const registros = await ProdutosModels.buscarTodos(req.query);

    if (!registros || registros.length === 0) {
      return res
        .status(200)
        .json({ message: "Nenhum registro encontrado.", data: [] });
    }

    res.json({
      message: "Produtos encontrados com sucesso.",
      data: registros,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await ProdutosModels.buscarPorId(id);

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json({
      message: "Produto encontrado com sucesso.",
      data: produto,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produto." });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const produtoExistente = await ProdutosModels.buscarPorId(id);

    if (!produtoExistente) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado para atualizar." });
    }

    const produto = new ProdutosModels({
      id: id,
      nome: req.body.nome ?? produtoExistente.nome,
      descricao: req.body.descricao ?? produtoExistente.descricao,
      categoria: req.body.categoria ?? produtoExistente.categoria,
      preco: req.body.preco
        ? parseFloat(req.body.preco)
        : produtoExistente.preco,
      disponivel:
        req.body.disponivel !== undefined
          ? req.body.disponivel === true || req.body.disponivel === "true"
          : produtoExistente.disponivel,
    });

    const data = await produto.atualizar();

    res.json({
      message: `Produto ${data.nome} atualizado com sucesso`,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await ProdutosModels.buscarPorId(id);

    if (!produto) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado para deletar." });
    }

    await produto.deletar();

    res.json({
      message: `O registro "${produto.nome}" foi deletado com sucesso!`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
