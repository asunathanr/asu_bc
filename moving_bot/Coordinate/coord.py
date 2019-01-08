"""
File: coord.py
Authors: Pedro Reyes, Kelsey Lewis, Ryan Pounders, Nathan Robertson
Purpose:
    A class that represents a coordinate on a grid. Coordinates have an x and a y component which acts
    like an index for that coordinate.
"""

__all__ = ["Coord"]


class Coord:
    __slots__ = ('x', 'y')

    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

    def __eq__(self, other):
        """
        :param other: Another Coord object
        :return: If self is equal to other and other is a Coord
        """
        return self.x == other.x and self.y == other.y

    def __ne__(self, other):
        return not (self == other)

    def __str__(self):
        return '(' + str(self.x) + ',' + str(self.y) + ')'

    def __hash__(self):
        """
        Coords need to be hashed if they are going in a set or dict
        :return: Hash of a Coord object
        """
        return hash((self.x, self.y))
