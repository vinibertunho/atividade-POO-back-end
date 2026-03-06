import prisma from "../utils/prismaClient.js";

export default class ProdutosModels {
  constructor({
    id = null,
    nome = "",
    descricao = "",
    categoria = "",
    preco = 0,
    disponivel = true,
  } = {}) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.categoria = categoria;
    this.preco = preco;
    this.disponivel = disponivel;
  }

  async criar() {
    if (this.preco <= 0) {
      throw new Error(
        `Produto não pode ser criado com o preco igual ou menor que 0!`,
      );
    }

    return await prisma.produto.create({
      data: {
        nome: this.nome,
        descricao: this.descricao,
        categoria: this.categoria,
        preco: this.preco,
        disponivel: this.disponivel,
      },
    });
  }

  async produtoAdicionadoAoPedido(produtoId, pedidoId) {
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(produtoId) },
    });

    if (!produto || !produto.disponivel) {
      throw new Error("Não pode adicionar produto indisponivel ao pedido");
    }

    return await prisma.itemPedido.create({
      data: {
        produtoId: parseInt(produtoId),
        pedidoId: parseInt(pedidoId),
        quantidade: 1,
        precoUnit: produto.preco,
      },
    });
  }

  async atualizar() {
    if (!this.id) throw new Error("Produto id é obrigatório atualizar");

    if (this.preco <= 0) {
      throw new Error(
        `Produto não pode ser criado com o preco igual ou menor que 0!`,
      );
    }

    return await prisma.produto.update({
      where: { id: parseInt(this.id) },
      data: {
        nome: this.nome,
        descricao: this.descricao,
        categoria: this.categoria,
        preco: this.preco,
        disponivel: this.disponivel,
      },
    });
  }

  async deletar() {
    if (!this.id) throw new Error("Produto id obrigatório deletar");

    const pedidoAberto = await prisma.itemPedido.findFirst({
      where: {
        produtoId: parseInt(this.id),
        pedido: { status: "Aberto" },
      },
    });

    if (pedidoAberto) {
      throw new Error(
        "Não pode deletar o produto que está vinculado a pedido aberto",
      );
    }

    return await prisma.produto.delete({
      where: { id: parseInt(this.id) },
    });
  }

  static async buscarTodos(filtros = {}) {
    const { nome, precoMin, precoMax, disponivel, categoria } = filtros;
    const where = {};

    if (nome) where.nome = { contains: nome, mode: "insensitive" };
    if (categoria) where.categoria = categoria.toUpperCase();
    if (disponivel !== undefined) where.disponivel = disponivel === "true";
    if (precoMin) where.preco = { gte: Number(precoMin) };
    if (precoMax) where.preco = { lte: Number(precoMax) };

    return await prisma.produto.findMany({ where });
  }

  static async buscarPorId(id) {
    const data = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) return null;
    return new ProdutosModels(data);
  }
}
