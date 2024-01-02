const graphContainer = document.getElementById('graph-container');

// Fetch the JSON file
fetch("graph.json")
  .then((response) => response.json())
  .then((graph) => {
    if (graph.length <= 0) {
        return;
    }

    /* This doesn't work
    const numColumns = graph[0].length;

    // prints '3'
    console.log("Num columns " + numColumns);

    // this doesn't work
    graphContainer.style.gridTemplateColumns = "repeat(${numColumns}, 1fr)";

    // hmmm...
    const actualStyle = window.getComputedStyle(graphContainer);

    // prints 'none'
    console.log("Grid template columns... " + actualStyle.getPropertyValue('grid-template-columns'));
    */

    // keep in mind that each number of columns is its own css class
    const numColumns = graph[0].length;
    console.log("Num columns " + numColumns);

    graphContainer.classList.add('columns-' + numColumns);

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
