import type { Database } from "bun:sqlite";
import { randomUUID } from "crypto";
import type { PedidoRepository } from "@/slices/pedidos/pedido.repository";
import type { Pedido, LineaPedido } from "@/slices/pedidos/pedido.types";
import { groupRowsBy } from "@/infrastructure/database/utils/groupRowsBy";

export function createSqlitePedidoRepository(db: Database): PedidoRepository {
  function mapPedido(pedidoRow: any, lineasRows: any[]): Pedido {
    return {
      id: pedidoRow.id,
      codigoPedido: pedidoRow.codigo_pedido,
      codigoSuministrador: pedidoRow.codigo_suministrador,
      fecha: new Date(pedidoRow.fecha),
      origen: pedidoRow.origen,
      lineasPedido: lineasRows.map(
        (l): LineaPedido => ({
          id: l.id,
          idPedido: l.id_pedido,
          producto: l.producto,
          cantidad: l.cantidad,
          regimenFiscal: l.regimen_fiscal,
        }),
      ),
    };
  }

  async function findById(id: string): Promise<Pedido | null> {
    const rows = db
      .query<any, [string]>(
        `
      SELECT 
        p.id as p_id,
        p.codigo_pedido,
        p.codigo_suministrador,
        p.fecha,
        p.origen,
        l.id as l_id,
        l.producto,
        l.cantidad,
        l.regimen_fiscal
      FROM pedidos p
      LEFT JOIN lineas_pedido l 
        ON l.id_pedido = p.id
      WHERE p.id = ?
    `,
      )
      .all(id);

    if (rows.length === 0) return null;

    const { p_id, codigo_pedido, codigo_suministrador, fecha, origen } =
      rows[0];

    return {
      id: p_id,
      codigoPedido: codigo_pedido,
      codigoSuministrador: codigo_suministrador,
      fecha: new Date(fecha),
      origen,
      lineasPedido: Array.from(
        rows
          .filter((r) => r.l_id)
          .map((r) => ({
            id: r.l_id,
            idPedido: p_id,
            producto: r.producto,
            cantidad: r.cantidad,
            regimenFiscal: r.regimen_fiscal,
          })),
      ),
    };
  }

  async function findAll(): Promise<Pedido[]> {
    const rows = db
      .query<any, []>(
        `
      SELECT 
        p.id as p_id,
        p.codigo_pedido,
        p.codigo_suministrador,
        p.fecha,
        p.origen,
        l.id as l_id,
        l.producto,
        l.cantidad,
        l.regimen_fiscal
      FROM pedidos p
      LEFT JOIN lineas_pedido l 
        ON l.id_pedido = p.id
      ORDER BY p.id
    `,
      )
      .all();

    const pedidosMap = rows.reduce((acc, row) => {
      if (!acc.has(row.p_id)) {
        acc.set(row.p_id, {
          id: row.p_id,
          codigoPedido: row.codigo_pedido,
          codigoSuministrador: row.codigo_suministrador,
          fecha: new Date(row.fecha),
          origen: row.origen,
          lineasPedido: [],
        });
      }

      if (row.l_id) {
        acc.get(row.p_id)!.lineasPedido.push({
          id: row.l_id,
          idPedido: row.p_id,
          producto: row.producto,
          cantidad: row.cantidad,
          regimenFiscal: row.regimen_fiscal,
        });
      }

      return acc;
    }, new Map<string, Pedido>());

    return Array.from(pedidosMap.values());
  }

  async function create(data: Omit<Pedido, "id">): Promise<Pedido> {
    const id = randomUUID();

    const tx = db.transaction(() => {
      db.query(
        `
        INSERT INTO pedidos
        (id, codigo_pedido, codigo_suministrador, fecha, origen)
        VALUES (?, ?, ?, ?, ?)
      `,
      ).run(
        id,
        data.codigoPedido,
        data.codigoSuministrador,
        data.fecha.toISOString(),
        data.origen,
      );

      for (const linea of data.lineasPedido) {
        const lineaId = randomUUID();

        db.query(
          `
          INSERT INTO lineas_pedido
          (id, id_pedido, producto, cantidad, regimen_fiscal)
          VALUES (?, ?, ?, ?, ?)
        `,
        ).run(lineaId, id, linea.producto, linea.cantidad, linea.regimenFiscal);
      }
    });

    tx();

    return { ...data, id };
  }

  async function update(pedido: Pedido): Promise<void> {
    const tx = db.transaction(() => {
      db.query(
        `
        UPDATE pedidos
        SET codigo_pedido = ?, 
            codigo_suministrador = ?, 
            fecha = ?, 
            origen = ?
        WHERE id = ?
      `,
      ).run(
        pedido.codigoPedido,
        pedido.codigoSuministrador,
        pedido.fecha.toISOString(),
        pedido.origen,
        pedido.id,
      );

      db.query(`DELETE FROM lineas_pedido WHERE id_pedido = ?`).run(pedido.id);

      for (const linea of pedido.lineasPedido) {
        db.query(
          `
          INSERT INTO lineas_pedido
          (id, id_pedido, producto, cantidad, regimen_fiscal)
          VALUES (?, ?, ?, ?, ?)
        `,
        ).run(
          linea.id,
          pedido.id,
          linea.producto,
          linea.cantidad,
          linea.regimenFiscal,
        );
      }
    });

    tx();
  }

  async function remove(id: string): Promise<void> {
    db.query(`DELETE FROM pedidos WHERE id = ?`).run(id);
  }

  return {
    create,
    findById,
    findAll,
    update,
    delete: remove,
  };
}
