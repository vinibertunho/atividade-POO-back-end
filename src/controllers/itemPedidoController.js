import itemPedidoModel from "../models/itemPedidosModel.js";

export const criar = async (req, res) => {
  try {
    const item = new itemPedidoModel(req.body);
    const data = await item.criar();
    res.status(201).json({ message: "Registro criado com sucesso!", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const registros = await itemPedidoModel.buscarTodos(req.query);
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registros." });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const data = await itemPedidoModel.buscarPorId(req.params.id);
    if (!data) return res.status(404).json({ error: "Não encontrado." });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registro." });
  }
};

export const atualizar = async (req, res) => {
  try {
    const item = new itemPedidoModel({ id: req.params.id, ...req.body });
    const data = await item.atualizar();
    res.json({ message: "Atualizado com sucesso!", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const item = new itemPedidoModel({ id: req.params.id });
    await item.deletar();
    res.json({ message: "Deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
