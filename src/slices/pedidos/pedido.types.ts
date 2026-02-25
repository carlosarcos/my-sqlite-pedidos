export interface LineaPedido {
  id: string;
  idPedido: string;
  producto: string;
  cantidad: number;
  regimenFiscal: string;
}

export interface Pedido {
  id: string;
  codigoPedido: string;
  codigoSuministrador: string;
  fecha: Date;
  origen: string;
  lineasPedido: LineaPedido[];
}
