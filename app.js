// dependency (?)
const graphContainer = document.getElementById("graph-container");

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
  lineElement.innerHTML =
    "<div class='graph-edge' style='left:" +
    cx +
    "px; top:" +
    cy +
    "px; width:" +
    length +
    "px; -moz-transform:rotate(" +
    angle +
    "deg); -webkit-transform:rotate(" +
    angle +
    "deg); -o-transform:rotate(" +
    angle +
    "deg); -ms-transform:rotate(" +
    angle +
    "deg); transform:rotate(" +
    angle +
    "deg);'/>";
  graphContainer.appendChild(lineElement);
}

function renderGraph(contents) {
  console.log("read " + contents);

  // variables
  const graph = JSON.parse(contents); // nodeName --> [ nodeDependencyName ]
  const nodeRowIndex = getRows(graph); // nodeName --> int rowIndex
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
      const nodeDependencies = graph[nodeName];

      // draw graph node
      console.log("RENDER " + nodeName);
      const nodeElement = document.createElement("div");
      nodeElement.innerHTML = nodeName;
      nodeElement.classList.add("graph-node");
      rowDiv.appendChild(nodeElement);
      nodeDiv[nodeName] = nodeElement;

      // draw edges
      console.log("  dependencies: " + JSON.stringify(graph[nodeName]));
      for (let k = 0; k < nodeDependencies.length; k++) {
        const dependencyNodeName = nodeDependencies[k];
        const dependencyNodeElement = nodeDiv[dependencyNodeName];

        console.log("EDGE " + nodeName + " - " + dependencyNodeName);
        drawConnectingLine(nodeElement, dependencyNodeElement);
      }
    }
  }
}
function main() {
  // Fetch the JSON file
  fetch("graph.json")
    .then((response) => response.text())
    .then(renderGraph)
    .catch((error) => {
      console.log("Error fetching data:", error);
    });
}

main();
