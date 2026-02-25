import type { Pedido } from "./pedido.types";
import type { PedidoRepository } from "./pedido.repository";

export function createPedidoService(repo: PedidoRepository) {
  return {
    crearPedido(data: Omit<Pedido, "id">) {
      return repo.create(data);
    },

    obtenerPedido(id: string) {
      return repo.findById(id);
    },

    listarPedidos() {
      return repo.findAll();
    },

    actualizarPedido(pedido: Pedido) {
      return repo.update(pedido);
    },

    eliminarPedido(id: string) {
      return repo.delete(id);
    },
  };
}
