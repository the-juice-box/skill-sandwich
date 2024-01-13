import graphJson from "./tech-tree.json" assert { type: "json" };
const techTreeContainer = document.querySelector(".tech-tree");
const techTreeEdgesContainer = document.querySelector(".tech-tree-edges");
const startButton = document.querySelector(".start-btn");

const DEFAULT_ICON = "assets/default-icon.png";

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
function getOffset(el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset,
    width: rect.width || el.offsetWidth,
    height: rect.height || el.offsetHeight,
  };
}

function generateTechTree(techTreeJson) {
  // @post: generates node/edge html elements per node in the graph
  // @param: Object graph {}

  // unpack the new format of tech tree json into the old format of graph
  const upgradeDependencies = {}; // nodeName --> [ dependencyNodeName ];
  const techTreeUpgrades = {}; // nodeName --> { dependencies, icon, display-name, blurb }
  for (var categoryName in techTreeJson) {
    const upgrades = techTreeJson[categoryName];
    for (var upgradeName in upgrades) {
      const upgrade = upgrades[upgradeName];
      const thisUpgradesDependencies = upgrade.dependencies;
      if (!thisUpgradesDependencies) {
        // throw (idk how to do that yet in js ;=;)
        continue;
      }

      // save upgrade to 1d object
      upgradeDependencies[upgradeName] = thisUpgradesDependencies;
      techTreeUpgrades[upgradeName] = upgrade;
    }
  }

  // turn dependency graph into a set of rows of nodes
  const [rowIndexToNodes, nodeToRowIndex] =
    unpackGraphDependencies(upgradeDependencies);
  const nodeIcons = {}; // nodeName --> Icon HTML element
  const nodeEdges = {}; // nodeName --> [ edge HTML element ]

  // render nodes in the graph
  for (let i = 0; i < rowIndexToNodes.length; i++) {
    // create row element
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("tech-tree-row");
    techTreeContainer.appendChild(rowDiv);

    for (let j = 0; j < rowIndexToNodes[i].length; j++) {
      // get upgrade data from json
      const nodeName = rowIndexToNodes[i][j];
      const upgrade = techTreeUpgrades[nodeName];
      const iconImgSrc = upgrade.icon || DEFAULT_ICON;
      const displayName = upgrade["display-name"] || nodeName;
      const blurb = upgrade.blurb || "";

      // create node element
      const nodeDiv = document.createElement("div");
      nodeDiv.classList.add("tech-tree-node");
      rowDiv.appendChild(nodeDiv);

      // create node icon
      const nodeImg = document.createElement("img");
      nodeImg.src = iconImgSrc;
      nodeImg.classList.add("tech-tree-img");
      nodeDiv.appendChild(nodeImg);
      nodeIcons[nodeName] = nodeImg;

      // create node blurb
      const nodeBlurb = document.createElement("div");
      nodeBlurb.innerHTML = "<h3>" + displayName + "</h3>" + blurb;
      nodeBlurb.classList.add("tech-tree-blurb");
      nodeDiv.appendChild(nodeBlurb);
    }
  }

  // render edges in the graph
  function drawConnectingLine(nodeName, dependencyNodeName) {
    // elements
    const edgeName = nodeName + "-" + dependencyNodeName;
    const nodeElement = nodeIcons[nodeName];
    const dependencyNodeElement = nodeIcons[dependencyNodeName];
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
      lineElement.classList.add("tech-tree-edge");
      lineElement.id = edgeName;

      // save it to nodeEdges for later
      nodeEdges[nodeName][dependencyNodeName] = lineElement;
    }

    // update line's transform
    lineElement.style.left = cx + "px";
    lineElement.style.top = cy + "px";
    lineElement.style.width = length + "px";
    lineElement.style.transform = `rotate(${angle}deg)`;
    techTreeEdgesContainer.appendChild(lineElement);
  }
  function onScreenResize() {
    // @post: redraws all edges between nodes
    techTreeEdgesContainer.innerHTML = "";
    for (var nodeName in upgradeDependencies) {
      if (!upgradeDependencies[nodeName]) {
        continue;
      }

      for (let i = 0; i < upgradeDependencies[nodeName].length; i++) {
        const dependencyNodeName = upgradeDependencies[nodeName][i];
        drawConnectingLine(nodeName, dependencyNodeName);
      }
    }
  }
  window.addEventListener("resize", onScreenResize);
  onScreenResize();

  // support "back to start" button
  startButton.addEventListener("click", function() {
    const firstNodeName = rowIndexToNodes[0][0];
    const firstNodeIcon = nodeIcons[firstNodeName];
    if (firstNodeIcon) {
      firstNodeIcon.scrollIntoView();
    }  
  })
}

generateTechTree(graphJson);
