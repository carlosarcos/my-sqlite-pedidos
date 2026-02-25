export function groupRowsBy<TKey, TParent, TChild>(
  rows: any[],
  getKey: (row: any) => TKey,
  createParent: (row: any) => TParent,
  createChild: (row: any) => TChild | null,
  attachChild: (parent: TParent, child: TChild) => void,
): TParent[] {
  const map = rows.reduce((acc, row) => {
    const key = getKey(row);

    if (!acc.has(key)) {
      acc.set(key, createParent(row));
    }

    const child = createChild(row);
    if (child) {
      attachChild(acc.get(key)!, child);
    }

    return acc;
  }, new Map<TKey, TParent>());

  return Array.from(map.values());
}
