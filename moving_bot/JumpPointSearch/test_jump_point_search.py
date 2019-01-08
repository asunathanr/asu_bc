import unittest
from Coordinate.coord import Coord
from functools import reduce
from UniformGrid.diagonal_grid import DiagonalGrid
from JumpPointSearch.jps_node import JPSNode
from JumpPointSearch.jump_point_search import JumpPointSearch
from heuristics import diagonal, diagonal_tie_breaker


"""
File: test_jump_point_search.py
Author: Nathan Robertson
Purpose: Test if jump point search can correctly find minimum path on a diagonal grid.
"""


def coords_to_str(coords: [Coord]) -> str:
    return str(reduce(lambda c1, c2: str(c1) + ', ' + str(c2), coords))


def coordinate_mismatch_message(expected: [], actual: []) -> str:
    return 'Expected ' + coords_to_str(expected) + ' but got ' + coords_to_str(actual) + ' instead.'


class JumpTest(unittest.TestCase):
    def setUp(self):
        self.grid = DiagonalGrid(4, 4, [])
        self.obstacle_grid = DiagonalGrid(4, 4, [Coord(0, 2)])
        self.jps = JumpPointSearch(self.grid, diagonal)

    def test_horizontal_jump(self):
        expected_coord = Coord(0, 3)
        coord = self.jps.jump(Coord(0, 0), Coord(0, 1), expected_coord)
        self.assertEqual(expected_coord, coord)

    def test_diagonal_jump(self):
        expected_coord = Coord(3, 3)
        coord = self.jps.jump(Coord(0, 0), Coord(1, 1), expected_coord)
        self.assertEqual(expected_coord, coord)

    def test_blocked_jump(self):
        obstacle_jps = JumpPointSearch(self.obstacle_grid, diagonal)
        coord = obstacle_jps.jump(Coord(0, 1), Coord(0, 1), Coord(0, 3))
        self.assertIsNone(coord)


class ForcedNeighborTest(unittest.TestCase):
    def setUp(self):
        self.grid = DiagonalGrid(4, 4, [])
        self.obstacle_grid = DiagonalGrid(4, 4, [Coord(0, 2)])
        self.jps = JumpPointSearch(self.grid, diagonal)

    def test_is_forced_neighbor(self):
        forced_neighbor_grid = DiagonalGrid(4, 4, [Coord(1, 2)])
        obstacle_jps = JumpPointSearch(forced_neighbor_grid, diagonal)
        neighbors = obstacle_jps.has_forced_neighbors(Coord(0, 2), Coord(0, 1))
        self.assertTrue(neighbors)

    def test_not_forced_neighbor(self):
        forced = self.jps.has_forced_neighbors(Coord(0, 0), Coord(0, 1))
        self.assertFalse(forced, "Error: forced neighbor occurred in empty grid space.")

    def test_forced_diagonal(self):
        obstacle_grid = DiagonalGrid(4, 4, [Coord(2, 1)])
        diag_jps = JumpPointSearch(obstacle_grid, diagonal)
        expected = Coord(3, 1)
        current = JPSNode(Coord(2, 2), Coord(1, 1))
        neighbors = set(diag_jps.forced_neighbors(current.coord, current.direction))
        self.assertTrue(expected in neighbors)


class PruneTest(unittest.TestCase):
    def setUp(self):
        self.grid = DiagonalGrid(4, 4, [])
        self.obstacle_grid = DiagonalGrid(4, 4, [Coord(0, 2)])
        self.jps = JumpPointSearch(self.grid, diagonal_tie_breaker)

    def test_prune_start_node(self):
        expected = {Coord(0, 1)}
        current = JPSNode(Coord(0, 0), Coord(0, 1))
        neighbors = set(self.jps.prune(current))
        self.assertEqual(expected, neighbors)

    def test_prune_diagonal_node(self):
        expected = {Coord(1, 2), Coord(2, 1), Coord(2, 2)}
        current = JPSNode(Coord(1, 1), Coord(1, 1))
        neighbors = set(self.jps.prune(current))
        self.assertEqual(expected, neighbors)

    def test_prune_horizontal_node(self):
        expected = {Coord(1, 2)}
        current = JPSNode(Coord(1, 1), Coord(0, 1))
        neighbors = set(self.jps.prune(current))
        self.assertEqual(expected, neighbors)


class JumpPointSearchTest(unittest.TestCase):
    def setUp(self):
        self.grid = DiagonalGrid(4, 4, [])
        self.obstacle_grid = DiagonalGrid(4, 4, [Coord(0, 2)])
        self.jps = JumpPointSearch(self.grid, diagonal)

    def test_horizontal_execute(self):
        goal = Coord(0, 3)
        expected = [JPSNode(Coord(0, 0), None), JPSNode(goal, Coord(0, 1))]
        path = self.jps.execute((Coord(0, 0), goal))
        self.assertEqual(expected, path)

    def test_diagonal_execute(self):
        goal = Coord(3, 3)
        expected = [Coord(0, 0), goal]
        path = list(map(lambda jump_point: jump_point.coord, self.jps.execute((Coord(0, 0), goal))))
        self.assertEqual(expected, path)

    def test_obstacle_execute(self):
        expected = [JPSNode(Coord(0, 0), None), JPSNode(Coord(1, 1), Coord(1, 1)), JPSNode(Coord(1, 2), Coord(0, 1)), JPSNode(Coord(0, 3), Coord(-1, 1))]
        obstacle_jps = JumpPointSearch(self.obstacle_grid, diagonal)
        path = obstacle_jps.execute((Coord(0, 0), Coord(0, 3)))
        self.assertEqual(expected, path, coordinate_mismatch_message(expected, path))

    def test_diagonal_obstacle(self):
        expected = [JPSNode(Coord(0, 0), None), JPSNode(Coord(2, 2), Coord(1, 1)),
                    JPSNode(Coord(3, 3), Coord(1, 1))]
        diagonal_obstacle_grid = DiagonalGrid(4, 4, [Coord(2, 1)])
        obstacle_jps = JumpPointSearch(diagonal_obstacle_grid, diagonal)
        path = obstacle_jps.execute((Coord(0, 0), Coord(3, 3)))
        self.assertEqual(expected, path, coordinate_mismatch_message(expected, path))

    def test_large_obstacle_grid(self):
        large_grid = DiagonalGrid(10, 10, [Coord(1, 8), Coord(5, 7), Coord(6, 0), Coord(7, 7)])
        obstacle_jps = JumpPointSearch(large_grid, diagonal_tie_breaker)
        path = obstacle_jps.execute((Coord(0, 0), Coord(9, 9)))


class SuccessorsTest(unittest.TestCase):
    def setUp(self):
        self.grid = DiagonalGrid(4, 4, [])
        self.jps = JumpPointSearch(self.grid, diagonal)

    def test_start_successors(self):
        """
        Test that a starting node produces all neighbors of it as successors.
        """
        expected = {JPSNode(Coord(0, 3), Coord(0, 1))}
        actual = self.jps.successors(JPSNode(Coord(0, 0), None), Coord(0, 3))
        self.assertEqual(expected, actual)


class ConnectJumpPointsTest(unittest.TestCase):
    def setUp(self):
        self.grid = DiagonalGrid(4, 4, [])
        self.jps = JumpPointSearch(self.grid, diagonal)

    def test_full_horizontal_path(self):
        goal = Coord(0, 3)
        expected = [Coord(0, 0), Coord(0, 1), Coord(0, 2), Coord(0, 3)]
        path = self.jps.execute((Coord(0, 0), goal))
        self.assertEqual(expected, self.jps.connect_path(path))

    def test_full_diagonal_path(self):
        expected = [Coord(0, 0), Coord(1, 1), Coord(2, 2), Coord(3, 3)]
        path = self.jps.execute((Coord(0, 0), Coord(3, 3)))
        self.assertEqual(expected, self.jps.connect_path(path))

    def test_obstacle_execute(self):
        obstacle_grid = DiagonalGrid(4, 4, [Coord(0, 2)])
        expected = [Coord(0, 0), Coord(0, 1), Coord(1, 0)]
