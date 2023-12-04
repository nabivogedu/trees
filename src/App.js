import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import './index.css';

const generateFullTree = (rootId, maxLevels) => {
  let idCounter = 1;

  const createNode = (source, level) => {
    if (level > maxLevels) return [];

    return Array.from({ length: 6 }, () => {
      const destinationId = `${source}-${idCounter++}`;
      return {
        name: destinationId,
        attributes: {
          source: source,
          destination: destinationId,
          weight: Math.floor(Math.random() * 10) + 1,
          parent: source,
        },
        children: createNode(destinationId, level + 1),
      };
    });
  };

  return { name: rootId, children: createNode(rootId, 1) };
};

const findNode = (node, path) => {
  return path.reduce((currentNode, part) => {
    return currentNode?.children?.find(child => child.name === part) || null;
  }, node);
};

const getMaxPath = (node) => {
  if (!node || !node.children || node.children.length === 0) {
    return { path: [node.name], weight: 0 };
  }

  return node.children.reduce((max, child) => {
    const { path, weight } = getMaxPath(child);
    const totalWeight = weight + (child.attributes?.weight || 0);
    if (totalWeight > max.weight) {
      return { path: [node.name, ...path], weight: totalWeight };
    }
    return max;
  }, { path: [], weight: 0 });
};

const App = () => {
  const [fullTree, setFullTree] = useState({});
  const [visibleTree, setVisibleTree] = useState(null);

  useEffect(() => {
    const tree = generateFullTree('A', 5);
    setFullTree(tree);
    setVisibleTree({ name: tree.name, children: tree.children });
  }, []);

  const onNodeClick = useCallback((nodeData) => {
    const nodeName = nodeData.data.name;
    if (!nodeName) {
      console.error('Invalid node data:', nodeData);
      return;
    }

    const path = nodeName.split('-');
    const node = findNode(fullTree, path);
    if (node && node.children) {
      setVisibleTree(prevTree => {
        const newTree = { ...prevTree };
        const targetNode = findNode(newTree, path);
        if (targetNode) {
          targetNode.children = node.children;
        }
        return newTree;
      });
    }
  }, [fullTree]);

  const maxPathInfo = useMemo(() => getMaxPath(fullTree), [fullTree]);

  const treeComponent = useMemo(() => (
    <Tree
      data={visibleTree}
      orientation="vertical"
      translate={{ x: window.innerWidth / 2, y: window.innerHeight / 5 }}
      separation={{ siblings: 2, nonSiblings: 2 }} 
      onNodeClick={onNodeClick}
      initialDepth={0}
    />
  ), [visibleTree, onNodeClick]);

  return (
    <div className="App h-screen w-full">
      {visibleTree ? treeComponent : <p>Loading tree data...</p>}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-blue-200 p-4 box-border">
        <strong>Max Path:</strong> {maxPathInfo.path.join(' -> ')} <br />
        <strong>Total Weight:</strong> {maxPathInfo.weight}
      </div>
    </div>
  );
};

export default App;
