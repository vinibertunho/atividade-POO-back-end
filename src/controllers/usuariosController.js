import UsuarioModel from "../models/UsuarioModel.js";

const tratarErro = (res, error) => {
  if (error.code === "P2002") {
    return res
      .status(400)
      .json({ error: "Dados duplicados (CPF, E-mail ou Telefone)." });
  }
  return res.status(400).json({ error: error.message });
};

export const criar = async (req, res) => {
  try {
    const usuario = new UsuarioModel(req.body);
    const data = await usuario.criar();
    res.status(201).json({ message: "Registro criado com sucesso!", data });
  } catch (error) {
    tratarErro(res, error);
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const registros = await UsuarioModel.buscarTodos(req.query);
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registros." });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const usuario = await UsuarioModel.buscarPorId(parseInt(req.params.id));
    if (!usuario)
      return res.status(404).json({ error: "Registro não encontrado." });
    const clima = await usuario.buscarClimaAtual();
    res.json({ data: usuario, clima });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registro." });
  }
};

export const atualizar = async (req, res) => {
  try {
    const usuarioExistente = await UsuarioModel.buscarPorId(
      parseInt(req.params.id),
    );
    if (!usuarioExistente)
      return res.status(404).json({ error: "Registro não encontrado." });
    Object.assign(usuarioExistente, req.body);
    const data = await usuarioExistente.atualizar();
    res.json({ message: "Registro atualizado!", data });
  } catch (error) {
    tratarErro(res, error);
  }
};

export const deletar = async (req, res) => {
  try {
    const usuario = await UsuarioModel.buscarPorId(parseInt(req.params.id));
    if (!usuario)
      return res.status(404).json({ error: "Registro não encontrado." });
    await usuario.deletar();
    res.json({ message: "Registro deletado com sucesso!" });
  } catch (error) {
    tratarErro(res, error);
  }
};
