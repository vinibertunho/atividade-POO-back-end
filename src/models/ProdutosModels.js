import prisma from "../utils/prismaClient.js";

export default class ProdutosModels {
    constructor({ 
        id = null, 
        nome = '', 
        descricao = '', 
        categoria = '', 
        preco = 0, 
        disponivel = true 
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = Number(preco);
        this.disponivel = disponivel;
    }

    validar() {
        if (this.preco <= 0) {
            throw new Error(`O preço deve ser maior que 0.`);
        }
        if (this.nome.length < 3) {
            throw new Error(`O nome deve ter no mínimo 3 caracteres.`);
        }
        if (this.descricao && this.descricao.length > 225) {
            throw new Error(`A descrição deve ter no máximo 225 caracteres.`);
        }
        // Validação para o Enum do seu Schema
        const categoriasValidas = ['LANCHE', 'BEBIDA', 'SOBREMESA', 'COMBO'];
        if (!categoriasValidas.includes(this.categoria.toUpperCase())) {
            throw new Error(`Categoria inválida. Use: ${categoriasValidas.join(', ')}`);
        }
    }

    async criar() {
        this.validar();

        return await prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria.toUpperCase(),
                preco: this.preco,
                disponivel: this.disponivel
            },
        });
        
    }

    async atualizar() {
        if (!this.id) throw new Error("ID do produto é obrigatório para atualizar.");
        this.validar();
        return await prisma.produto.update({
            where: { id: parseInt(this.id) },
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria.toUpperCase(),
                preco: this.preco,
                disponivel: this.disponivel
            },
        });
    }

async deletar() {
    if (!this.id) throw new Error("ID do produto é obrigatório para deletar.");

    const produtoEmPedidoAberto = await prisma.itemPedido.findFirst({
        where: {
            produtoId: parseInt(this.id),
            pedido: {
                status: "ABERTO"
            }
        },
        include: { pedido: true } 
    });

    if (produtoEmPedidoAberto) {
        throw new Error(
            `Não é possível deletar o produto, ele está vinculado ao pedido #${produtoEmPedidoAberto.pedidoId} que ainda está ABERTO.`
        );
    }

    return await prisma.produto.delete({
        where: { id: parseInt(this.id) },
    });
}

    static async buscarTodos(filtros = {}) {
        const { nome, categoria, disponivel } = filtros;
        const where = {};

        if (nome) where.nome = { contains: nome, mode: "insensitive" };
        if (categoria) where.categoria = categoria.toUpperCase();
        if (disponivel !== undefined) where.disponivel = disponivel === "true";

        return await prisma.produto.findMany({ 
            where,
            orderBy: { nome: 'asc' }
        });
    }

    static async buscarPorId(ID) {
      try {
    const produto = await ProdutosModels.buscarPorId(req.params.id);
    res.json(produto);
} catch (Error) {
    res.status(404).json({ success: false, message: Error.message });
}

    }
    
} 