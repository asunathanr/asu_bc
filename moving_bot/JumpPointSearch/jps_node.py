"""
File: jps_node.py
Author: Nathan Robertson
Purpose:
    Represents a node for the Jump Point Search algorithm.
"""


class JPSNode:
    def __init__(self, coord, direction, g=1, f=0):
        self.coord = coord
        self.direction = direction
        self.f = g
        self.g = f

    def __lt__(self, other):
        return self.f < other.f

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.coord == other.coord and self.direction == other.direction

    def __ne__(self, other):
        return isinstance(other, self.__class__) and not (self == other)

    def __hash__(self):
        return hash((self.coord, self.direction))
