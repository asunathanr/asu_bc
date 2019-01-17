class AStarNode {
  constructor(f, coord, parent, g=1) {
    this.f = f;
    this.g = g;  
    this.coord = coord;
    this.parent = parent;
  }

  lt(other) {
    return this.f < other.f;
  }
}

export default AStarNode;