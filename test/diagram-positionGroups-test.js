import positionGroup from '../src/positionGroup';

import test from 'tape';


test('positionGroup()', t => {
  const nodes = new Map([
    ["a1", {
      "dy": 75,
      "y": 30,
      "x": 0,
      "id": "a1",
    }],
    ["b", {
      "dy": 150,
      "y": 75,
      "x": 300,
      "id": "b",
    }],
    ["a2", {
      "dy": 75,
      "y": 195,
      "x": 0,
      "id": "a2",
    }]
  ]);

  const group1 = {
    "title": "Group",
    "nodes": ["a1", "a2"]
  };

  const group2 = {
    "title": "B",
    "nodes": ["b"]
  };

  const group3 = {
    "title": "All",
    "nodes": ["a1", "a2", "b"]
  };

  t.deepEqual(positionGroup(nodes, group1), {
    title: "Group",
    nodes: ["a1", "a2"],
    rect: {
      top: 30,
      left: 0,
      bottom: 195 + 75,
      right: 0
    }
  }, 'group1');

  t.deepEqual(positionGroup(nodes, group2), {
    title: "B",
    nodes: ["b"],
    rect: {
      top: 75,
      left: 300,
      bottom: 75 + 150,
      right: 300
    }
  }, 'group2');

  t.deepEqual(positionGroup(nodes, group3), {
    title: "All",
    nodes: ["a1", "a2", "b"],
    rect: {
      top: 30,
      left: 0,
      bottom: 195 + 75,
      right: 300
    }
  }, 'group3');

  t.end();
});
