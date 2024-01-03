const graphContainer = document.getElementById('graph-container');

// Fetch the JSON file
fetch("graph.json")
  .then((response) => response.json())
  .then((graph) => {
    if (graph.length <= 0) {
        return;
    }

    const numColumns = graph[0].length;
    console.log("Num columns " + numColumns);
    graphContainer.style.gridTemplateColumns = '1fr '.repeat(numColumns);

    for (let i = 0; i < graph.length; i++) {
        for (let j = 0; j < graph[i].length; j++) {
            const graphNode = document.createElement('div');
            graphNode.textContent = graph[i][j];
            graphNode.classList.add('grid-item');
            graphContainer.appendChild(graphNode);
        }
    }
  })
  .catch((error) => {
    console.log("Error fetching data:", error);
  });
