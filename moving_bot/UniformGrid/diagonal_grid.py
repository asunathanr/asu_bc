from Coordinate.coord import Coord
from UniformGrid.uniform_grid import UniformGrid
from functools import lru_cache


class DiagonalGrid(UniformGrid):

    def __init__(self, xsize: int, ysize: int, obstacles: list):
        super().__init__(xsize, ysize, obstacles)

    @lru_cache(maxsize=None)
    def neighbors(self, coord: Coord) -> list:
        """
        :param coord:
        :return: All neighbors of coord in a list. (A coord with no neighbors would return empty list)
        """
        make_neighbor = lambda x, y: Coord(coord.x + x, coord.y + y)
        dist = map(lambda i: make_neighbor(i[0], i[1]),
                   [(0, -1), (0, 1), (-1, 0), (1, 0), (-1, -1), (1, 1), (-1, 1), (1, -1)])
        return list(filter(lambda i: self.is_adjacent(coord, i), list(dist)))