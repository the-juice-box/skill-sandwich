import graphJson from "./graph.json" assert { type: "json" };
const techTreeContainer = document.querySelector(".tech-tree");

function unpackGraphDependencies(dependencies) {
  // @return: Array rowIndexToNodes (int rowIndex --> [ string nodeName ])
  // @return: Object nodeToRowIndex (string nodeName --> int rowIndex)

  // var
  const rowIndexToNodes = []; // rowIndex --> [ nodeName ]
  const nodeToRowIndex = {}; // nodeName --> rowIndex

  // private
  function getRowIndex(nodeName) {
    // @return: int rowIndex
    // (it's one more than this node's max dependent node's row index)

    // a node's row index may already have been calculated, so we can reuse it
    if (nodeToRowIndex[nodeName]) {
      return nodeToRowIndex[nodeName];
    }

    // check that this node has dependencies
    const nodeDependencies = dependencies[nodeName]; // [ dependencyNodeName ]
    if (!nodeDependencies) {
      return -1;
    }

    // the row index is one more than the max dependent index
    // a 'root' node, with no dependencies, will be index = 0
    var rowIndex = -1;
    for (let i = 0; i < nodeDependencies.length; i++) {
      rowIndex = Math.max(rowIndex, getRowIndex(nodeDependencies[i]));
    }
    rowIndex += 1;

    // save this node's row index for later
    nodeToRowIndex[nodeName] = rowIndex;
    
    // returning is necessary for the row index calculation to work
    return rowIndex;
  }

  // init
  for (var nodeName in dependencies) {
    const rowIndex = getRowIndex(nodeName);
    if (!rowIndexToNodes[rowIndex]) {
      rowIndexToNodes[rowIndex] = [];
    }
    rowIndexToNodes[rowIndex][rowIndexToNodes[rowIndex].length] = nodeName;
  }

  return [rowIndexToNodes, nodeToRowIndex];
}
function generateTechTree(graph) {
  // @post: generates node/edge html elements per node in the graph
  // @param: Object graph {}

  const [rowIndexToNodes, nodeToRowIndex] =
    unpackGraphDependencies(graph.dependencies);

  // render nodes in the graph
  for (let i = 0; i < rowIndexToNodes.length; i++) {
    // create row element
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("tech-tree-row");
    techTreeContainer.appendChild(rowDiv);

    for (let j = 0; j < rowIndexToNodes[i].length; j++) {
      // create node element
      const nodeName = rowIndexToNodes[i][j];
      const nodeDiv = document.createElement("div");
      nodeDiv.classList.add("tech-tree-node");
      rowDiv.appendChild(nodeDiv);

      // create node icon
      const nodeImg = document.createElement("img");
      nodeImg.src = graph.icons[nodeName] || "default-icon.png";
      nodeImg.classList.add("tech-tree-img");
      nodeDiv.appendChild(nodeImg);

      // create node blurb
      const nodeBlurb = document.createElement("p")
      nodeBlurb.innerHTML = graph.blurbs[nodeName] || nodeName;
      nodeBlurb.classList.add("tech-tree-blurb");
      nodeDiv.appendChild(nodeBlurb);

      console.log(nodeName);
    }
  }

  // render edges in the graph
}

generateTechTree(graphJson);
