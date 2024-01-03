const graphContainer = document.getElementById('graph-container');

function renderGraph(contents) {
  console.log("read " + contents);
  //const contents = event.target.result;
      
  // Split the contents into lines
  const lines = contents.split('\n');

  console.log("Lines " + lines)

  // what's the max line length?
  let maxLineLength = lines.reduce((max, line) => Math.max(max, line.length), 0);

  // Process each line
  lines.forEach((line, index) => {

    
    // Process each character in the line
    for (let i = 0; i < maxLineLength; i++) {
      // each character in the line is a cell, even if it's just empty
      const gridCell = document.createElement('div');
      gridCell.classList.add('grid-item');
      graphContainer.appendChild(gridCell);

      gridCell.textContent = line.charAt(i);

      // make it invisible if whitespace or empty
      if (line.charAt(i).trim() === '') {
        gridCell.style.visibility = 'hidden';
      }
    }
  });

  // grid columns
  console.log("Max line length: " + maxLineLength);
  graphContainer.style.gridTemplateColumns = '1fr '.repeat(maxLineLength);
}

  // Fetch the JSON file
  fetch("test.txt")
    .then(response => response.text())
    .then(renderGraph)
    .catch((error) => {
      console.log("Error fetching data:", error);
    });
