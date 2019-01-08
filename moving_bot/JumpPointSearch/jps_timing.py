from UniformGrid.diagonal_grid import DiagonalGrid
from UniformGrid.uniform_grid import print_diagonal
from heuristics import diagonal_tie_breaker
# My JPS implementation
from JumpPointSearch.jump_point_search import *
import timeit
import random

"""
File: jps_timing.py
Author: Nathan Robertson
Purpose:
    Investigate efficiency of jump point search algorithm implementation.
    Battlecode 2017's map took place on maps ranging from size 20x20 to 50x50. 
    Therefore the next order of magnitude is 100x100.
    The max time given was 10 seconds with 0.05 seconds added each round. 
    I will start with trying to get a 100x100 in under 10 seconds then progressively decrease the time.
    The current goal is to get it to run 100x100 grids with obstacles in <= 0.05 second
    Update:
        I managed to meet the above goal (100x100 grid in <= 0.05 seconds). 
        Now I think the next efficency goals are to be split into two parts.
        1. Get the average timing to be in range 1 ms <= n < 10 ms  for a 100x100 grid.
        2. Find 100 randomly generated paths on a grid in < 1 second.

    Run in terminal with command: python -m cProfile -o profiling_results astar_timing.py
    to generate a file called profiling_results which can be viewed by running the display_stats.py script
"""


def make_diagonal_grid(size: (int, int), obstacle_prob: int) -> DiagonalGrid:
    """
    :param size: tuple of max x and max y values
    :param obstacle_prob: Probability that an obstacle is on a tile.
    :return: AStar grid with randomly generated obstacles
    """
    obstacles = []
    xsize, ysize = size
    for i in range(0, xsize):
        for j in range(0, ysize):
            if random.randint(0, 100) < obstacle_prob:
                obstacles.append(Coord(i, j))
    return DiagonalGrid(xsize, ysize, obstacles)


def find_path(graph, endpoints, heuristic):
    return JumpPointSearch(graph, heuristic).execute(endpoints)


def print_result(fn, times):
    print(timeit.timeit(fn, number=times))


xsize = 10
ysize = 10

obstacle_prob = [1, 10, 20, 50]
grid = make_diagonal_grid((xsize, ysize), obstacle_prob=10)
top_left = Coord(0, 0)
bottom_right = Coord(xsize - 1, ysize - 1)

if __name__ == "__main__":
    try:
        print("Compute jump points only: ")
        jps = JumpPointSearch(grid, diagonal_tie_breaker)
        print_result(lambda: jps.execute((top_left, bottom_right)), 1000)
        print("Compute jump points and points between them.")
        print_result(lambda: jps.connect_path(jps.execute((top_left, bottom_right))), 1000)
    except RecursionError as e:
        print(e)
        print_diagonal(grid, [])
