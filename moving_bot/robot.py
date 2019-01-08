from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random

__pragma__('iconv')
__pragma__('tconv')
#__pragma__('opov')


# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1

    def turn(self):
        self.step += 1
        self.log("START TURN " + self.step)
        self.log("Castle health: " + self.me['health'])

robot = MyRobot()
