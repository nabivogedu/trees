import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';

export function generateTreeArray(rootId, levels) {
  const array = [];
  let idCounter = 1;

  function createNode(source, level) {
    if (level > levels) return;

    for (let i = 0; i < 6; i++) {
      const destinationId = `${source}-${idCounter++}`;
      array.push({
        source: source,
        destination: destinationId,
        root: rootId,
        weight: Math.floor(Math.random() * 10) + 1, 
        parent: level === 1 ? null : source,
      });
      createNode(destinationId, level + 1);
    }
  }

  createNode(rootId, 1);
  return array;
}

export function buildTree(array) {
  const nodes = {};

  array.forEach(({ source, destination, weight }) => {
    if (!nodes[source]) {
      nodes[source] = { name: source, children: [], weights: {} };
    }
    if (!nodes[destination]) {
      nodes[destination] = { name: destination, children: [], weights: {} };
    }
    nodes[source].children.push({ ...nodes[destination], weight });
    nodes[source].weights[destination] = weight;
  });

  return Object.values(nodes).find(node => !array.some(item => item.destination === node.name));
}

// This function logs the number of direct children for a given parent, excluding siblings
function logChildCount(array, parent) {
  const parentNodes = array.filter(item => item.source === parent);
  console.log(`Parent ${parent} has ${parentNodes.length} direct children.`);
  parentNodes.forEach(child => console.log(child.destination));
}

const findMaxWeightPath = (node) => {
  let maxWeight = 0;
  let maxPath = [];

  const findPath = (currentNode, path, totalWeight) => {
    if (!currentNode.children || currentNode.children.length === 0) {
      if (totalWeight > maxWeight) {
        maxWeight = totalWeight;
        maxPath = path;
      }
    } else {
      currentNode.children.forEach((child) => {
        findPath(child, [...path, child.name], totalWeight + child.weight);
      });
    }
  };

  findPath(node, [node.name], 0);
  return maxPath;
};

const App = () => {
  const [treeData, setTreeData] = useState([]);
  const [maxPath, setMaxPath] = useState([]);

  useEffect(() => {
    const generatedArray = generateTreeArray('A', 2);
    const treeStructure = buildTree(generatedArray);

    console.log('Tree structure:', treeStructure);

    const maxWeightPath = findMaxWeightPath(treeStructure);
    setMaxPath(maxWeightPath);

    console.log('Max weight path:', maxWeightPath);

    logChildCount(generatedArray, 'A');

    setTreeData([treeStructure]);
  }, []);

  const renderCustomPath = (linkData) => {
    const weight = linkData.target.data.weight;
    console.log('Rendering path for:', linkData.target.data);

    const isMaxPath = maxPath.includes(linkData.target.data.name);

    if (isMaxPath) console.log('Max path link found:', linkData.target.data);

    const midpointX = (linkData.source.x + linkData.target.x) / 2;
    const midpointY = (linkData.source.y + linkData.target.y) / 2;

    return (
      <g>
        <path
          d={`M${linkData.source.x},${linkData.source.y}L${linkData.target.x},${linkData.target.y}`}
          stroke={isMaxPath ? 'red' : '#b3b3b3'}
          strokeWidth={3}
        />
        <text
          x={midpointX}
          y={midpointY}
          style={{
            fontSize: '12px',
            fontFamily: 'Arial',
            fill: isMaxPath ? 'red' : 'black',
            pointerEvents: 'none',
          }}
          textAnchor="middle"
        >
          {weight}
        </text>
      </g>
    );
  };


  return (
    <div className="App" style={{ width: '100%', height: '100vh' }}>
      {treeData.length > 0 ? (
        <Tree
          data={treeData}
          orientation="vertical"
          renderCustomLink={renderCustomPath}
          translate={{ x: window.innerWidth / 2, y: window.innerHeight / 10 }}
          separation={{ siblings: 1, nonSiblings: 1.5 }}
        />
      ) : (
        <p>Loading tree data...</p>
      )}
    </div>
  );
};

export default App;