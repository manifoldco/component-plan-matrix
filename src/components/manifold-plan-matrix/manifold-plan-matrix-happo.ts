export const skeleton = () => {
  const matrix = document.createElement('manifold-plan-matrix');
  document.body.appendChild(matrix);
  return matrix;
};

export const planMatrix = () => {
  const grid = document.createElement('manifold-plan-matrix');
  grid.productId = '234w1jyaum5j0aqe3g3bmbqjgf20p'; // JawsDB MySQL

  document.body.appendChild(grid);

  return grid.componentOnReady();
};
