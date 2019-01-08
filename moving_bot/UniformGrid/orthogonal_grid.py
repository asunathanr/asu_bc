from Coordinate.coord import Coord
from UniformGrid.uniform_grid import UniformGrid

"""
File: orthogonal_grid.py
Authors: Kelsey Lewis, Ryan Pounders, Pedro Reyes, Nathan Robertson
Purpose:
    Describes a OrthogonalGrid class used in path finding algorithms.
    Entities using this class will be able to move orthogonally (north, south, east, and west).
    Uses a Sparse Grid implementation which only stores obstacles and size of grid.
"""


class OrthogonalGrid(UniformGrid):
    def __init__(self, xsize: int, ysize: int, obstacles: list):
        super().__init__(xsize, ysize, obstacles)

    def neighbors(self, coord: Coord) -> list:
        """
        :param coord:
        :return: All neighbors of coord in a list. (A coord with no neighbors would return empty list)
        """
        make_neighbor = lambda x, y: Coord(coord.x + x, coord.y + y)
        dist = map(lambda i: make_neighbor(i[0], i[1]), [(0, -1), (0, 1), (-1, 0), (1, 0)])
        return list(filter(lambda i: self.is_adjacent(coord, i), dist))


def print_grid(grid: OrthogonalGrid, path: []):
    """
    Print a grid with path.
    :param grid: OrthogonalGrid to print
    :param path: Path
    """
    for i in range(0, grid.xsize):
        for j in range(0, grid.ysize):
            coord = Coord(i, j)
            if coord in path:
                val = 'P'
            elif coord in grid.obstacles():
                val = 'X'
            else:
                val = '.'
            print(val, sep=' ', end=' ')
        print()
