function radius(pos, r) {
  coords = [];
  for (let i = pos[0] - r; i < pos[0] + r; ++i) {
      for (let j = pos[1] - r; j < pos[1] + r; ++j) {
          if (i !== 0 && j !== 0) {
              coords.push([i, j]);
          }
      }
  }
  return coords;
}

console.log(radius([0, 0], 3));