import { getDatabase } from "@/infrastructure/database/client";
import { initDatabase } from "@/infrastructure/database/init";
import { createSqlitePedidoRepository } from "@/infrastructure/database/pedido.repository.sqlite";
import { createPedidoService } from "@/slices/pedidos/pedido.service";

const db = getDatabase();
initDatabase();

const pedidoRepository = createSqlitePedidoRepository(db);
const pedidoService = createPedidoService(pedidoRepository);

const pedido = await pedidoService.crearPedido({
  codigoPedido: "PED-003",
  codigoSuministrador: "309",
  fecha: new Date(),
  origen: "API-B2B",
  lineasPedido: [
    {
      id: "",
      idPedido: "",
      producto: "BG07",
      cantidad: 15000,
      regimenFiscal: "N",
    },
  ],
});

console.log(pedido);
