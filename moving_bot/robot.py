from battlecode import BCAbstractRobot, SPECS
from enum import Enum
import battlecode as bc
import random

__pragma__('iconv')
__pragma__('tconv')
#__pragma__('opov')


"""
Requirements:
    1. Should know its neighbors.
    2. Should pick a destination from its neighbors.
    3. Should be able to move to destination
    4. If destination contains resource should pick up resource
    5. Store accumulated resources in nearest castle
As always requirements are fluid and subject to change at any time.
"""


class UnitTypes(Enum):
    """
    From documentation:
    r.unit: The robot's unit type, where
     0 stands for Castle,
     1 stands for Church,
     2 stands for Pilgrim,
     3 stands for Crusader,
     4 stands for Prophet,
      and 5 stands for Preacher. Available if visible.
    """
    CASTLE = 0
    CHURCH = 1
    KNIGHT = 2
    CRUSADER = 3
    PROPHET = 4
    PREACHER = 5


# don't try to use global variables!!
class Unit(BCAbstractRobot):
    step = -1

    def turn(self):
        self.step += 1

    def neighbors(self):
        pass


robot = Unit()
