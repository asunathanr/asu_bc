import heapq

"""
File: jps_hash_heap.py
Author: Nathan Robertson
Purpose:
    A hash heap like the one used in the A* algorithm but build specifically for the JPS algorithm.
"""


class JPSHashHeap:
    def __init__(self):
        self.heap = []
        self.values = set()

    def add(self, jump_node):
        if jump_node not in self.values:
            heapq.heappush(self.heap, jump_node)
            self.values.add(jump_node)

    def top(self):
        if len(self.heap) > 0:
            return self.heap[0]
        return None

    def pop(self):
        if len(self.heap) > 0:
            value = heapq.heappop(self.heap)
            self.values.remove(value)
            return value
        return None

    def find(self, value):
        return value in self.values

    def __len__(self):
        return len(self.heap)