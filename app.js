// dependency
import graph from "./graph.json" assert { type: "json" };
//import {MarkdownBlock, MarkdownSpan, MarkdownElement} from "https://md-block.verou.me/md-block.js";

const graphContainer = document.getElementById("graph-container");
const graphEdgesContainer = document.getElementById("graph-edges");
const infoPane = document.getElementById("info-pane");
const defaultNodeInfoElement = document.getElementById("default-node-info");
const nextButton = document.getElementById("next-btn");
const prevButton = document.getElementById("prev-btn");
const skipButton = document.getElementById("skip-btn");

// var
var nodeRowIndex;
const graphRows = []; // rowIndex --> [ nodeName ]
const nodeElements = {}; // nodeName --> <div>
const nodeEdges = {}; // nodeName --> { dependencyNodeName: <div> } (the edges)

const nodeOrder = []; // i --> nodeName
var selectedNodeIndex = -1;
var prevNodeInfoElement = defaultNodeInfoElement;

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
function drawConnectingLine(nodeName, dependencyNodeName) {
  // elements
  const edgeName = nodeName + "-" + dependencyNodeName;
  const nodeElement = nodeElements[nodeName];
  const dependencyNodeElement = nodeElements[dependencyNodeName];
  if (!nodeEdges[nodeName]) {
    nodeEdges[nodeName] = {};
  }

  // div element centers
  const off1 = getOffset(nodeElement);
  const off2 = getOffset(dependencyNodeElement);
  const x1 = off1.left + 0.5 * off1.width;
  const y1 = off1.top + 0.5 * off1.height;
  const x2 = off2.left + 0.5 * off2.width;
  const y2 = off2.top + 0.5 * off2.height;

  // line geometry
  const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  const cx = (x1 + x2) / 2 - length / 2;
  const cy = (y1 + y2) / 2; // - thickness / 2;
  const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

  // get line or initialize it
  var lineElement = nodeEdges[nodeName][dependencyNodeName];
  if (!lineElement) {
    lineElement = document.createElement("div");
    lineElement.classList.add("graph-edge");
    lineElement.id = edgeName;

    // save it to nodeEdges for later
    nodeEdges[nodeName][dependencyNodeName] = lineElement;
  }

  // update line's transform
  lineElement.style.left = cx + "px";
  lineElement.style.top = cy + "px";
  lineElement.style.width = length + "px";
  lineElement.style.transform = `rotate(${angle}deg)`;
  graphEdgesContainer.appendChild(lineElement);
}

// info-pane & revealing new nodes
function renderNodeInfo() {
  /* makes the info pane display a node's blurb */
  /* node infos are html elements in the info-pane */

  // make previous node info go away
  if (prevNodeInfoElement) {
    prevNodeInfoElement.style.display = "none";
  }

  // look up new node info element
  const nodeName = nodeOrder[selectedNodeIndex];
  const newNodeInfoElement =
    document.getElementById(nodeName) || defaultNodeInfoElement;
  newNodeInfoElement.style.display = "contents";

  // save it for later
  prevNodeInfoElement = newNodeInfoElement;
}
function selectNode(newNodeIndex) {
  /* change which node is "selected" */

  if (typeof(newNodeIndex) === "string") {
    for (let i = 0; i < nodeOrder.length; i++) {
      if (nodeOrder[i] === newNodeIndex) {
        newNodeIndex = i;
        break;
      }
    }
    if (typeof(newNodeIndex) === "string") {
      return false;
    }
  }

  if (newNodeIndex < 0 || newNodeIndex >= nodeOrder.length) {
    return false;
  }

  selectedNodeIndex = newNodeIndex;
  renderNodeInfo();

  return true;
}
function revealNextNode() {
  // increment selectedNodeIndex; don't do anything if there is no next
  const success = selectNode(selectedNodeIndex + 1);
  if (!success) {
    return;
  }

  // make the next node visible
  const nodeName = nodeOrder[selectedNodeIndex];
  const nodeElement = nodeElements[nodeName];
  nodeElement.style.visibility = "visible";

  // make its edges visible
  for (var dependencyNodeName in nodeEdges[nodeName]) {
    const edgeElement = nodeEdges[nodeName][dependencyNodeName];
    edgeElement.style.visibility = "visible";
  }
}

// main
function renderGraph() {
  /* draws the tech tree */

  // unpack the graph json file
  nodeRowIndex = getRows(graph.dependencies); // nodeName --> int rowIndex

  // initialize 2d array of nodes
  for (var nodeName in nodeRowIndex) {
    // initialize 2d array of nodes, in order
    const i = nodeRowIndex[nodeName];
    if (graphRows[i] === undefined) {
      graphRows[i] = [];
    }
    graphRows[i][graphRows[i].length] = nodeName;
  }

  // initialize 1d array of nodes, in order of appearance in 2d array
  for (let i = 0; i < graphRows.length; i++) {
    for (let j = 0; j < graphRows[i].length; j++) {
      nodeOrder[nodeOrder.length] = graphRows[i][j];
    }
  }

  // render the nodes in the graph
  for (let i = 0; i < graphRows.length; i++) {
    // draw graph row
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("graph-row");
    graphContainer.appendChild(rowDiv);

    for (let j = 0; j < graphRows[i].length; j++) {
      // var
      const nodeName = graphRows[i][j];

      // draw graph node
      const nodeElement = document.createElement("div");
      nodeElement.innerHTML = nodeName;
      nodeElement.classList.add("graph-node");
      rowDiv.appendChild(nodeElement);
      nodeElements[nodeName] = nodeElement;

      // display info about this technology upon click
      nodeElement.addEventListener("click", function () {
        selectNode(nodeName);
      });

      // draw node's icon, if it exists
      if (graph.icons[nodeName]) {
        const iconElement = document.createElement("img");
        iconElement.innerHTML = `src='${graph.icons[nodeName]}'`;
        nodeElement.appendChild(iconElement);
      }
    }
  }

  // render the edges between graph nodes
  function renderEdges() {
    graphEdgesContainer.innerHTML = "";
    for (var nodeName in graph.dependencies) {
      if (!graph.dependencies[nodeName]) {
        continue;
      }

      for (let i = 0; i < graph.dependencies[nodeName].length; i++) {
        const dependencyNodeName = graph.dependencies[nodeName][i];
        drawConnectingLine(nodeName, dependencyNodeName);
      }
    }
  }
  window.addEventListener("resize", renderEdges);
  renderEdges();

  // reveal as you scroll
  var scrollCounter = 0;
  function a() {}
  document.body.addEventListener("wheel", function (e) {
    // only while scrolling down
    if (e.deltaY <= 0) {
      return;
    }

    // debounce
    scrollCounter += e.deltaY;
    if (scrollCounter <= 100) {
      return;
    }
    scrollCounter = 0;

    // do the thing
    revealNextNode();
  });

  // reveal the first node
  revealNextNode();

  // buttons
  nextButton.addEventListener("click", revealNextNode);
  prevButton.addEventListener("click", function () {
    selectNode(selectedNodeIndex - 1);
  });
  skipButton.addEventListener("click", function () {
    while (selectedNodeIndex < nodeOrder.length - 1) {
      revealNextNode();
    }
  });
}

renderGraph();
