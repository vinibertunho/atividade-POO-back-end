import prisma from '../utils/prismaClient.js';

export default class ProdutosModels {
    constructor({ id = Number, nome = String, descricao = String, categoria = categoria,preco = Decimal(10, 2), disponivel = Boolean, itens = String } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
        this.itens = itens;

    }

    async criar() {
        if (preco <= 0 ) {
            console.log(`Produto não pode ser criado!`);
            return;
        }

        if (disponivel = false) {
            console.log(`O produto não pode ser adicionado!`);
            return;

        } else {
            console.log(`Produto criado com sucesso`);
            return;
        }

        const produto  = await prisma.Produto.create({
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

        console.log(`Produto criado com sucesso!`);
        return produto;
    }

    async atualizar() {
        return prisma.Produto.update({
            where: { id: this.id },
            data: { nome: this.nome, descricao: this.descricao, categoria: this.categoria, preco: this.preco, disponivel: this.disponivel, itens: this.itens },
        });
    }

    async deletar() {
        if (disponivel = true) {
            console.log(`O produto não pode ser deletado`);
            return;
        } else {
            console.log(`O produto foi deletado com sucesso`);
            return prisma.Produto.delete({ where: { id: this.id } });
        }

    }



    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.estatus !== undefined) where.estatus = filtros.estatus === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.Produtos.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.Produtos.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutosModels(data);
    }
}
