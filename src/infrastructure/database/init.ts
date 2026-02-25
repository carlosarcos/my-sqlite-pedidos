import { getDatabase } from "./client";

export function initDatabase() {
  const db = getDatabase();

  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id TEXT PRIMARY KEY,
      codigo_pedido TEXT NOT NULL,
      codigo_suministrador TEXT NOT NULL,
      fecha TEXT NOT NULL,
      origen TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lineas_pedido (
      id TEXT PRIMARY KEY,
      id_pedido TEXT NOT NULL,
      producto TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      regimen_fiscal TEXT NOT NULL,
      FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id)
        ON DELETE CASCADE
    );
  `);
}
