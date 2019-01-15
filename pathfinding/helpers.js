function can_afford_action(cost, reserve) {
    return cost < reserve;
}
  
function unit_cost(specs, unit) {
    return specs["UNITS"][specs[unit]]["CONSTRUCTION_FUEL"];
}

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

export {can_afford_action, unit_cost, radius};