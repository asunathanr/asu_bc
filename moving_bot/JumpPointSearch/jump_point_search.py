import math
from JumpPointSearch.jps_hash_heap import JPSHashHeap
from functools import lru_cache
from JumpPointSearch.jps_node import JPSNode
from Coordinate.coord import Coord

"""
File: jump_point_search.py
Author: Nathan Robertson
Purpose:
    Original jump point search paper found here: http://grastien.net/ban/articles/hg-aaai11.pdf
    Jump Point search is a specialization of A*. It will only work well on binary diagonal grids with open space.
    
Terminology
    Cell: A location with x, y coordinates that is either an obstacle or is empty.
    Grid: A grid is a rectangular composition of cells. Grids in jump point search must allow diagonal movement.
    Path: a cycle-free ordered walk starting at node n0 and ending at node nk. Ordering is an important consequence
          of this definition. A path must be stored in a list or some ordered data structure, not a set.
    Direction: A vector representing one of eight allowable directions of travel.
    Neighbors: The 0 < n <= 8 cells surrounding a cell on a grid.
    Natural Neighbors: Any neighbor of a node x which is left over after applying the following dominance constraint
                       to all neighbors of node x:
        1. Straight moves: length of path from the parent to node n is <= the length of the path including x.
        2. Diagonal moves: Same as straight moves except <= becomes <
"""


NEXT_DIAGONALS = frozenset({(1, 1), (-1, -1), (-1, 1), (1, -1)})
STRAIGHT_COST = 1


class JumpPointSearch:
    def __init__(self, grid, heuristic_fn):
        self.grid = grid
        self.heuristic_fn = heuristic_fn

    def connect_path(self, jump_points: []) -> []:
        """
        Computes full path from jump points
        :param jump_points: A possibly non-connected sequence of nodes which were computed from the JPS algorithm.
        :return: A connected sequence (list) of nodes which comprises the path from a start node to a goal node.
        """
        def connect_jump_points(begin, end):
            total_cells = int(self.heuristic_fn(begin.coord, end.coord))
            return list(map(lambda offset: Coord(begin.coord.x + end.direction.x * offset, begin.coord.y + end.direction.y * offset),
                            range(0, total_cells)))

        path = []
        valid_jump_points = [jump_point for jump_point in jump_points if jump_point is not None]
        for i in range(0, len(valid_jump_points) - 1):
            begin = valid_jump_points[i]
            end = valid_jump_points[i + 1]
            path += connect_jump_points(begin, end)
        if len(valid_jump_points) > 0:
            path.append(valid_jump_points[len(valid_jump_points) - 1].coord)
        return path

    def execute(self, endpoints: (Coord, Coord)):
        """
        Finds the jump points that comprise a path from some start to some goal
        :param endpoints: A tuple containing (start, goal)
        :return:
        """
        start, goal = endpoints
        if start == goal:
            return [start]
        elif len(self.grid.neighbors(start)) == 0 or len(self.grid.neighbors(goal)) == 0:
            return []
        else:
            return self._raw_execute(start, goal)

    def _raw_execute(self, start, goal):
        start_node = JPSNode(start, None, 0, self.heuristic_fn(start, goal))
        open_set = JPSHashHeap()
        open_set.add(start_node)
        jump_points = []
        while len(open_set) > 0 and open_set.top().coord != goal:
            current = open_set.pop()
            jump_points.append(current)
            for successor in self.successors(current, goal):
                open_set.add(successor)
        return jump_points + [open_set.top()]

    def successors(self, current: JPSNode, goal: Coord):
        """
        Finds jump point successors of current JPSNode.
        :param current:
        :param goal:
        :return: A set of successors, including empty set if no successors are found.
        """
        succ = set()
        neighbors = self.prune(current)
        parent_x, parent_y = current.coord.x, current.coord.y
        for neighbor in neighbors:
            dir_coord = self.direction(current.coord, neighbor)
            next_jump_point = self.jump(Coord(parent_x, parent_y), Coord(dir_coord.x, dir_coord.y), goal)
            if next_jump_point is not None:
                next_node = JPSNode(next_jump_point, dir_coord)
                next_node.g = current.g + STRAIGHT_COST
                next_node.f = next_node.g + self.heuristic_fn(next_node.coord, goal)
                succ.add(next_node)
        return succ

    def jump(self, parent: Coord, direction: Coord, goal):
        """
        Finds next jump point recursively.
        Base cases:
        1. Next coordinate is out of bounds
        2. Next coordinate is an obstacle
        3. Next coordinate has forced neighbors

        :param parent: Previously considered point (not necessarily a jump point)
        :param direction: Direction to try finding next jump point.
        :param goal: Goal cell.
        :return: Next jump point to consider or None if direction is invalid.
        """
        def straight_moves():
            return {Coord(0, direction.y), Coord(direction.x, 0)}

        def invalid_direction() -> bool:
            return not self.grid.is_valid_coord(next_coord) or next_coord in self.grid.obstacles()

        def is_jump_point() -> bool:
            return next_coord == goal or self.has_forced_neighbors(next_coord, direction)

        next_coord = Coord(parent.x + direction.x, parent.y + direction.y)
        if invalid_direction():
            return None
        if is_jump_point():
            return next_coord
        if self.is_diagonal(direction):
            for i in straight_moves():
                if self.jump(next_coord, i, goal) is not None:
                    return next_coord
        return self.jump(next_coord, direction, goal)

    def has_forced_neighbors(self, coord: Coord, direction: Coord):
        """
        :param coord:
        :param direction:
        :return: If any forced neighbors exist for a particular coordinate
        """
        return len(self.forced_neighbors(coord, direction)) > 0

    def prune(self, current: JPSNode) -> set:
        """
        Prune all non-natural neighbors except those who are in front of forced neighbors.
        :param current:
        :return: All natural neighbors plus any forced neighbors.
        """
        if current.direction is None:
            return self.grid.neighbors(current.coord)
        natural_neighbors = self.natural_neighbors(current.coord, current.direction)
        forced_neighbors = self.forced_neighbors(current.coord, current.direction)
        neighbors = natural_neighbors.union(forced_neighbors)
        return set(filter(lambda neighbor: neighbor not in self.grid.obstacles(), neighbors))

    @lru_cache(maxsize=None)
    def forced_neighbors(self, coord, direction) -> set:
        """
        Forced neighbors are defined by the paper as:
        1. Not a natural neighbor of coord
        2. The length of a path from coord's parent to the coord through coord is less than the corresponding path
            without coord.
        This method is cached because the same coord and direction are called in hot areas of code. (Once in pruning
        and once in jump.) Recomputing it will slow program execution by an order of magnitude. A cache is a much cheaper
        way of obtaining the same information twice.

        :param coord: The current coordinate
        :param direction: Direction traveled to get to coord.
        :return: A set of forced neighbors (could be empty set)
        """
        def straight_forced_neighbors(coord, direction):
            orthogonal_direction = Coord(direction.y, direction.x)
            forced_candidates = {Coord(coord.x + orthogonal_direction.x, coord.y + orthogonal_direction.y),
                                 Coord(coord.x - orthogonal_direction.x, coord.y - orthogonal_direction.y)}
            forced = set(filter(lambda candidate: candidate in self.grid.obstacles(), forced_candidates))
            return set(map(lambda cell: Coord(cell.x + direction.x, cell.y + direction.y), forced))

        def diagonal_forced_neighbors(coord, direction):
            forced_candidates = {Coord(coord.x, coord.y - direction.y)}
            forced = set(filter(lambda candidate: candidate in self.grid.obstacles(), forced_candidates))
            return set(map(lambda cell: Coord(cell.x + direction.x, cell.y), forced))

        if self.is_diagonal(direction):
            return diagonal_forced_neighbors(coord, direction)
        else:
            return straight_forced_neighbors(coord, direction)

    def natural_neighbors(self, cell: Coord, direction: Coord) -> {}:
        """
        :param cell: A cell inside the current grid.
        :param direction: Direction previously traveled.
        :return: A set containing any natural neighbors of a cell.
        """
        if self.is_diagonal(direction):
            natural_neighbors = {
                    Coord(cell.x + direction.x, cell.y),
                    Coord(cell.x, cell.y + direction.y),
                    Coord(cell.x + direction.x, cell.y + direction.y)
            }
        else:
            natural_neighbors = {Coord(cell.x + direction.x, cell.y + direction.y)}
        return natural_neighbors

    def is_diagonal(self, direction: Coord) -> bool:
        """
        :param direction:
        :return: Whether a direction is diagonal or not
        """
        return direction.x != 0 and direction.y != 0

    def direction(self, parent: Coord, current: Coord):
        return Coord(current.x - parent.x, current.y - parent.y)
