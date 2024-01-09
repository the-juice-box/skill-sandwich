// dependency
import graph from './graph.json' assert { type: 'json' };
import {MarkdownBlock, MarkdownSpan, MarkdownElement} from "https://md-block.verou.me/md-block.js";

const graphContainer = document.getElementById("graph-container");
const graphEdgesContainer = document.getElementById("graph-edges");
const infoPane = document.getElementById("info-pane");

// unpack json file
function getRowIndex(graph, nodeRowIndex, nodeName) {
  /* recursively calculates the row index of a single node */

  // a node's row index may already have been calculated, so we can use that
  if (nodeRowIndex[nodeName]) {
    return nodeRowIndex[nodeName];
  }

  // if dependencies doesn't exist, then someone mistyped the name of a node somewhere...
  const dependencies = graph[nodeName];
  if (dependencies === null) {
    return -1;
  }

  // the row index is one more than the max dependent index
  // a 'root' node, with no dependencies, will be index = 0
  var maxChildIndex = -1;
  for (let i = 0; i < dependencies.length; i++) {
    maxChildIndex = Math.max(
      maxChildIndex,
      getRowIndex(graph, nodeRowIndex, dependencies[i])
    );
  }

  nodeRowIndex[nodeName] = maxChildIndex + 1;
  return nodeRowIndex[nodeName];
}
function getRows(graph) {
  /* calculates what rows the nodes should be displayed in */

  const nodeRowIndex = {};
  for (var nodeName in graph) {
    getRowIndex(graph, nodeRowIndex, nodeName);
  }
  return nodeRowIndex;
}

// rendering edges
function getOffset(el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset,
    width: rect.width || el.offsetWidth,
    height: rect.height || el.offsetHeight,
  };
}
function drawConnectingLine(div1, div2) {
  // div element centers
  const off1 = getOffset(div1);
  const off2 = getOffset(div2);
  const x1 = off1.left + 0.5 * off1.width;
  const y1 = off1.top + 0.5 * off1.height;
  const x2 = off2.left + 0.5 * off2.width;
  const y2 = off2.top + 0.5 * off2.height;

  // line geometry
  const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  const cx = (x1 + x2) / 2 - length / 2;
  const cy = (y1 + y2) / 2; // - thickness / 2;
  const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

  // render the line!!!
  const lineElement = document.createElement("div");
  lineElement.classList.add('graph-edge');
  lineElement.style.left = cx + "px";
  lineElement.style.top = cy + "px";
  lineElement.style.width = length + "px";
  lineElement.style.transform = `rotate(${angle}deg)`;
  graphEdgesContainer.appendChild(lineElement);
}

function renderTechnologyInfo(nodeName) {
  /* makes the info pane display a technology's blurb */
  if (graph.blurbs[nodeName]) {
    
    infoPane.innerHTML = `<md-block src='${graph.blurbs[nodeName]}'></md-block>`
    return;
  }

  // default
  infoPane.innerHTML = nodeName;
}
function renderGraph() {
  /* draws the tech tree */

  // unpack the graph
  const nodeRowIndex = getRows(graph.dependencies); // nodeName --> int rowIndex
  const graphRows = []; // rowIndex --> [ nodeName ]
  const nodeDiv = {}; // nodeName --> <div>

  for (var nodeName in nodeRowIndex) {
    const i = nodeRowIndex[nodeName];
    if (graphRows[i] === undefined) {
      graphRows[i] = [];
    }
    graphRows[i][graphRows[i].length] = nodeName;
  }

  // render the graph
  for (let i = 0; i < graphRows.length; i++) {
    // draw graph row
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("graph-row");
    graphContainer.appendChild(rowDiv);

    for (let j = 0; j < graphRows[i].length; j++) {
      // var
      const nodeName = graphRows[i][j];
      const nodeDependencies = graph.dependencies[nodeName];

      // draw graph node
      const nodeElement = document.createElement("div");
      nodeElement.innerHTML = nodeName;
      nodeElement.classList.add("graph-node");
      rowDiv.appendChild(nodeElement);
      nodeDiv[nodeName] = nodeElement;

      // display info about this technology upon click
      nodeElement.addEventListener('click', function() {
        renderTechnologyInfo(nodeName)
      })

      // draw node's icon, if it exists
      if (graph.icons[nodeName]) {
        const iconElement = document.createElement("img");
        iconElement.innerHTML = `src='${graph.icons[nodeName]}'`;
        nodeElement.appendChild(iconElement);
      }

      // draw edges
      for (let k = 0; k < nodeDependencies.length; k++) {
        const dependencyNodeName = nodeDependencies[k];
        const dependencyNodeElement = nodeDiv[dependencyNodeName];

        drawConnectingLine(nodeElement, dependencyNodeElement);
      }
    }
  }
}

renderGraph();
