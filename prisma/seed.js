import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient, Categoria } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Limpando tabelas...');
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.Usuario.deleteMany();

    console.log('👤 Criando 3 Usuários...');
    const u1 = await prisma.Usuario.create({
        data: {
            nome: 'Alice Silva',
            email: 'alice@email.com',
            telefone: '11911111111',
            cpf: '111',
            cep: '01001000',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });
    const u2 = await prisma.Usuario.create({
        data: {
            nome: 'Bruno Souza',
            email: 'bruno@email.com',
            telefone: '11922222222',
            cpf: '222',
            cep: '20040000',
            logradouro: 'Av. Rio Branco',
            bairro: 'Centro',
            localidade: 'RJ',
            uf: 'RJ',
        },
    });
    const u3 = await prisma.Usuario.create({
        data: {
            nome: 'Carla Dias',
            email: 'carla@email.com',
            telefone: '11933333333',
            cpf: '333',
            cep: '30140010',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });

    console.log('🍔 Criando 3 Produtos...');
    const p1 = await prisma.produto.create({
        data: { nome: 'X-Bacon', preco: 35.0, categoria: 'LANCHE', descricao: 'Bacon e cheddar' },
    });
    const p2 = await prisma.produto.create({
        data: { nome: 'Coca-Cola', preco: 8.0, categoria: 'BEBIDA', descricao: 'Lata 350ml' },
    });
    const p3 = await prisma.produto.create({
        data: {
            nome: 'Batata Frita',
            preco: 15.0,
            categoria: 'LANCHE',
            descricao: 'Porção individual',
        },
    });

    console.log('🛒 Criando 3 Pedidos (1 para cada cliente)...');

    // Pedido 1 (Alice): X-Bacon + Coca
    await prisma.pedido.create({
        data: {
            clienteId: u1.id,
            total: 43.0,
            status: 'PAGO',
            itens: {
                create: [
                    { produtoId: p1.id, quantidade: 1, precoUnitario: p1.preco },
                    { produtoId: p2.id, quantidade: 1, precoUnitario: p2.preco },
                ],
            },
        },
    });

    // Pedido 2 (Bruno): 2 Cocas
    await prisma.pedido.create({
        data: {
            clienteId: u2.id,
            total: 16.0,
            status: 'ABERTO',
            itens: {
                create: [{ produtoId: p2.id, quantidade: 2, precoUnitario: p2.preco }],
            },
        },
    });

    // Pedido 3 (Carla): Batata Frita
    await prisma.pedido.create({
        data: {
            clienteId: u3.id,
            total: 15.0,
            status: 'ABERTO',
            itens: {
                create: [{ produtoId: p3.id, quantidade: 1, precoUnitario: p3.preco }],
            },
        },
    });

    console.log('✅ Seed finalizado: 3 Clientes, 3 Produtos e 3 Pedidos criados!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
