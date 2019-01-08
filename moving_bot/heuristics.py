from functools import lru_cache


"""
    File: heuristics.py
    Author: Nathan Robertson
    Purpose:
        Heuristic functions to control direction of node expansion for A* algorithm.
"""


def manhattan(coord1, coord2):
    return abs(coord1.x - coord2.x) + abs(coord1.y - coord2.y)


def diagonal(coord1, coord2):
    return max(abs(coord1.x - coord2.x), abs(coord1.y - coord2.y))


@lru_cache(maxsize=None)
def tie_breaker_h(coord1, coord2):
    """
    Decorator heuristic which adds a tie breaker to the formula.
    Try to adjust the heuristic to favor certain tiles even if cost is the same.
    :param coord1:
    :param coord2:
    :return:
    """
    return manhattan(coord1, coord2) * (1.0 + 1/1000)


@lru_cache(maxsize=None)
def diagonal_tie_breaker(coord1, coord2):
    return diagonal(coord1, coord2) * (1.0 + 1 / 1000)
