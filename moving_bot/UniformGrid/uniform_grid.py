from Coordinate.coord import Coord
from abc import abstractmethod, ABC

"""
File: uniform_grid.py
Authors: Kelsey Lewis, Ryan Pounders, Pedro Reyes, Nathan Robertson
Purpose:
    Describes an abstract uniform grid class (each cell on the grid has the same cost.)
    The neighbors method is a template method because there are many different ways of determining the 
    neighbors of a cell, whereas the other methods in this class will probably not need to change.
    This is an example of the template method pattern.
"""


class UniformGrid(ABC):
    def __init__(self, xsize: int, ysize: int, obstacles: list):
        self.xsize = xsize
        self.ysize = ysize
        self.obstacle_set = self._initialize_obstacles(obstacles)
        self.CELL_VALUE = 1
        self.OBSTACLE_VALUE = 2
        self.INVALID_POSITION = -1

    def cost(self):
        """
        Returns cost (weight) to move into a cell on the grid.
        Preconditions: coord should be a point on the grid
        """
        return self.CELL_VALUE

    def is_adjacent(self, coord1: Coord, coord2: Coord) -> bool:
        """
        Is coordinate one adjacent to coordinate 2?
        """
        if self.is_valid_coord(coord1) and self.is_valid_coord(coord2):
            if coord1 in self.obstacle_set or coord2 in self.obstacle_set:
                return False
            if self.is_adjacent_position(coord1, coord2):
                return True
        return False

    def is_valid_coord(self, coord: Coord) -> bool:
        """
        :param coord:
        :return: If coordinate is in grid
        """
        if coord.x < 0 or coord.y < 0:
            return False
        if coord.x >= self.xsize or coord.y >= self.ysize:
            return False
        return True

    def is_adjacent_position(self, coord1: Coord, coord2: Coord) -> bool:
        """
        :param coord1:
        :param coord2:
        :return: True if coord1 is one tile away from coord2, false otherwise
        """
        diag_dist = max(abs(coord1.x - coord2.x), abs(coord1.y - coord2.y))
        if diag_dist == 1:
            return True
        return False

    @abstractmethod
    def neighbors(self, coord: Coord) -> list:
        """
        :param coord:
        :return: All neighbors of coord in a list. (A coord with no neighbors would return empty list)
        """
        pass

    def insert_obstacle(self, coord: Coord) -> None:
        """
        Add obstacle to grid
        :param coord:
        """
        if self.is_valid_coord(coord):
            self.obstacle_set.add(coord)

    def obstacles(self) -> set:
        """
        :return: All tiles that are impassable in the current OrthogonalGrid
        """
        return self.obstacle_set

    def _initialize_obstacles(self, potential_obstacles):
        return set(filter(lambda obstacle: self.is_valid_coord(obstacle), potential_obstacles))


def print_diagonal(grid: UniformGrid, path: []):
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
