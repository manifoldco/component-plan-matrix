const AIVEN_CASSANDRA = '234qqazjcy9xm55tf0xner1nrb2tj';
const GENERIC_TAGGING = '234hyjj2qbkpyw4z0g0bwgjgtydnj';
const JAWSDB_MYSQL = '234w1jyaum5j0aqe3g3bmbqjgf20p';
const PREFAB = '234j199gnaggg2qj6fvey2m3gw1nc';
const ZIGGEO = '234yycr3mf5f2hrw045vuxeatnd50';

function renderProduct(productID: string) {
  const grid = document.createElement('manifold-plan-matrix');
  const core = document.createElement('mui-core');
  grid.productId = productID;
  document.body.appendChild(core);
  document.body.appendChild(grid);
  return grid.componentOnReady();
}

export const skeleton = () => {
  const matrix = document.createElement('manifold-plan-matrix');
  const core = document.createElement('mui-core');
  document.body.appendChild(core);
  document.body.appendChild(matrix);
  return matrix;
};

export const aivenCassandra = () => renderProduct(AIVEN_CASSANDRA);
export const genericTagging = () => renderProduct(GENERIC_TAGGING);
export const jawsDbMysql = () => renderProduct(JAWSDB_MYSQL);
export const prefab = () => renderProduct(PREFAB);
export const ziggeo = () => renderProduct(ZIGGEO);
