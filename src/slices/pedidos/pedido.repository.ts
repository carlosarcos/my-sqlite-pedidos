import type { Pedido } from "./pedido.types";

export interface PedidoRepository {
  create(data: Omit<Pedido, "id">): Promise<Pedido>;
  findById(id: string): Promise<Pedido | null>;
  findAll(): Promise<Pedido[]>;
  update(pedido: Pedido): Promise<void>;
  delete(id: string): Promise<void>;
}
