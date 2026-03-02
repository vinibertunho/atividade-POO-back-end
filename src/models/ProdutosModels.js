import prisma from '../utils/prismaClient.js';

export default class ProdutosModels {
    constructor({ id = Number, nome = String, descricao = String, categoria = categoria, preco = Decimal(10, 2), disponivel = true, itens = String } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
        this.itens = itens;

    }

    async criar() {
        if (this.preco <= 0 ) {
            throw new Error(`Produto não pode ser criado com o preco igual ou menor que 0!`);
        }

        return await prisma.Produto.create({
            data: {
              //  id: this.id,
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
                itens: this.itens,
            },
        });
    }


        async produtoAdicionadoAoPedido(produtoId, pedidoId) {
            const produto = await prisma.Produto.findUnique({ where: { id: produtoId } });

            if (!produto.disponivel) {
                throw new Error("Não pode adicionar produto indisponivel ao pedido");
            }

            return await prisma.ItemPedido.create({
                data: { produtoId, pedidoId }
            });
        }
       // return produtos;



    async atualizar() {
       if (!this.id) throw new Error ("Produto id é obrigatório atualizar")
         if (this.preco <= 0) {
             throw new Error(`Produto não pode ser criado com o preco igual ou menor que 0!`);
         }

        return await prisma.Produto.update({
            where: { id: this.id },
             data: {
                 id: this.id,
                 nome: this.nome,
                 descricao: this.descricao,
                 categoria: this.categoria,
                 preco: this.preco,
                 disponivel: this.disponivel,
                 itens: this.itens,
             },
         });


    }

    async deletar() {
        if (!this.id) throw new Error("Produto id obrigatório deletar");

    const pedidoAberto = await prisma.ItemPedido.findFirst({
            where: {
                produtoId: this.id,
                pedido: { status: "Aberto"}
            }
        });

        if (pedidoAberto) {
            throw new Error("Não pode deletar o produto que está vinculado a pedido aberto");
        }
        return await prisma.Produto.delete({
            where: { id: this.id }
        });

    }


    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.estatus !== undefined) where.estatus = filtros.estatus === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.Produto.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.Produtos.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutosModels(data);
    }
}
