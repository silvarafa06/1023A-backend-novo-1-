
import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}

class CarrinhoController {
    // Adiciona item ao carrinho do usuário
    async adicionar(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade, precoUnitario, nome } = req.body;
        if (!usuarioId || !produtoId || !quantidade || !precoUnitario || !nome) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes" });
        }
        // Busca carrinho do usuário
        let carrinho = await db.collection('carrinhos').findOne({ usuarioId });
        if (!carrinho) {
            // Cria novo carrinho
            const novoCarrinho: Carrinho = {
                usuarioId,
                itens: [{ produtoId, quantidade, precoUnitario, nome }],
                dataAtualizacao: new Date(),
                total: quantidade * precoUnitario
            };
            await db.collection('carrinhos').insertOne(novoCarrinho);
            return res.status(201).json(novoCarrinho);
        }
        // Garante apenas 1 tipo de produto por carrinho
        const itemExistente = carrinho.itens.find((item: ItemCarrinho) => item.produtoId === produtoId);
        if (itemExistente) {
            return res.status(400).json({ error: "Produto já existe no carrinho. Atualize a quantidade." });
        }
        if (carrinho.itens.length > 0) {
            return res.status(400).json({ error: "Só é permitido 1 tipo de produto por carrinho." });
        }
        carrinho.itens.push({ produtoId, quantidade, precoUnitario, nome });
        carrinho.total += quantidade * precoUnitario;
        carrinho.dataAtualizacao = new Date();
        await db.collection('carrinhos').updateOne({ usuarioId }, { $set: carrinho });
        return res.status(200).json(carrinho);
    }

    // Atualiza quantidade de um item
    async atualizarQuantidade(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade } = req.body;
        if (!usuarioId || !produtoId || !quantidade) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes" });
        }
        let carrinho = await db.collection('carrinhos').findOne({ usuarioId });
        if (!carrinho) return res.status(404).json({ error: "Carrinho não encontrado" });
        const item = carrinho.itens.find((item: ItemCarrinho) => item.produtoId === produtoId);
        if (!item) return res.status(404).json({ error: "Produto não encontrado no carrinho" });
        item.quantidade = quantidade;
        carrinho.total = carrinho.itens.reduce((acc: number, i: ItemCarrinho) => acc + i.quantidade * i.precoUnitario, 0);
        carrinho.dataAtualizacao = new Date();
        await db.collection('carrinhos').updateOne({ usuarioId }, { $set: carrinho });
        return res.status(200).json(carrinho);
    }

    // Remove item do carrinho
    async removerItem(req: Request, res: Response) {
        const { usuarioId, produtoId } = req.body;
        if (!usuarioId || !produtoId) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes" });
        }
        let carrinho = await db.collection('carrinhos').findOne({ usuarioId });
        if (!carrinho) return res.status(404).json({ error: "Carrinho não encontrado" });
        carrinho.itens = carrinho.itens.filter((item: ItemCarrinho) => item.produtoId !== produtoId);
        carrinho.total = carrinho.itens.reduce((acc: number, i: ItemCarrinho) => acc + i.quantidade * i.precoUnitario, 0);
        carrinho.dataAtualizacao = new Date();
        await db.collection('carrinhos').updateOne({ usuarioId }, { $set: carrinho });
        return res.status(200).json(carrinho);
    }

    // Lista carrinho do usuário
    async listar(req: Request, res: Response) {
        const { usuarioId } = req.query;
        if (!usuarioId) return res.status(400).json({ error: "usuarioId é obrigatório" });
        const carrinho = await db.collection('carrinhos').findOne({ usuarioId });
        if (!carrinho) return res.status(404).json({ error: "Carrinho não encontrado" });
        return res.status(200).json(carrinho);
    }

    // Remove carrinho do usuário
    async remover(req: Request, res: Response) {
        const { usuarioId } = req.body;
        if (!usuarioId) return res.status(400).json({ error: "usuarioId é obrigatório" });
        await db.collection('carrinhos').deleteOne({ usuarioId });
        return res.status(200).json({ message: "Carrinho removido" });
    }
}

export default new CarrinhoController();