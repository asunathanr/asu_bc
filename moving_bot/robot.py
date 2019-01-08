from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random

__pragma__('iconv')
__pragma__('tconv')
#__pragma__('opov')


"""
Requirements:
    1. Should be able to pick a destination in its vision radius.
    2. Should be able to move to destination
    3. If destination contains resource should pick up resource
    4. Store accumulated resources in nearest castle
As always requirements are fluid and subject to change at any time.
"""


# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1

    def turn(self):
        self.step += 1
        self.log("START TURN " + self.step)
        self.log("Castle health: " + self.me['health'])

robot = MyRobot()
