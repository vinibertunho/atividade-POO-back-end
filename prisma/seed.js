import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient, Categoria } = pkg; // Importando Categoria para os produtos
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Limpando base de dados...');
    // Deletar na ordem inversa para evitar erros de relacionamento
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.usuario.deleteMany();

    console.log('👤 Criando 3 clientes...');
    const u1 = await prisma.usuario.create({
        data: {
            nome: 'Alice Silva',
            email: 'alice@email.com',
            telefone: '11911111111',
            cpf: '11122233344',
            cep: '13273649',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });

    const u2 = await prisma.usuario.create({
        data: {
            nome: 'Bruno Souza',
            email: 'bruno@email.com',
            telefone: '11922222222',
            cpf: '22233344455',
            cep: '01001000',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });

    const u3 = await prisma.usuario.create({
        data: {
            nome: 'Carla Dias',
            email: 'carla@email.com',
            telefone: '11933333333',
            cpf: '33344455566',
            cep: '20040000',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });

    console.log('🍔 Criando 3 produtos...');
    const p1 = await prisma.produto.create({
        data: { nome: 'X-Burger', preco: 25.0, categoria: 'LANCHE', descricao: 'Pão e carne' },
    });
    const p2 = await prisma.produto.create({
        data: { nome: 'Coca-Cola', preco: 8.0, categoria: 'BEBIDA', descricao: 'Lata 350ml' },
    });
    const p3 = await prisma.produto.create({
        data: {
            nome: 'Combo Família',
            preco: 85.0,
            categoria: 'COMBO',
            descricao: '3 Lanches e 1 Refri',
        },
    });

    console.log('🛒 Criando pedidos relacionados...');
    // Pedido da Alice (X-Burger + Coca)
    await prisma.pedido.create({
        data: {
            usuarioId: u1.id,
            total: 33.0,
            status: 'CONCLUIDO',
            itens: {
                create: [
                    { produtoId: p1.id, quantidade: 1, precoUnit: p1.preco },
                    { produtoId: p2.id, quantidade: 1, precoUnit: p2.preco },
                ],
            },
        },
    });

    // Pedido do Bruno (Combo Família)
    await prisma.pedido.create({
        data: {
            usuarioId: u2.id,
            total: 85.0,
            status: 'PENDENTE',
            itens: {
                create: [{ produtoId: p3.id, quantidade: 1, precoUnit: p3.preco }],
            },
        },
    });

    console.log('✅ Seed completo com relacionamentos!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
