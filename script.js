// Import Matter.js
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies;

// Array of colors to use
const colors = ['#2c7df6', '#72a8f9', '#1058c4', '#1058c4'];

// Select the .hero_animation div
const heroSection = document.querySelector('.hero_animation');

// Create engine
const engine = Engine.create();

// Function to calculate ground width based on viewport width
function calculateGroundWidth() {
    if (window.innerWidth < 480) {
        return heroSection.clientWidth * 0.9; // 90% width on mobile
    } else if (window.innerWidth > 1350) {
        return 980; // 40% width on large screens
    } else {
        return heroSection.clientWidth * 0.7; // 70% width for others
    }
}

// Create renderer with dynamic ground width
const render = Render.create({
    element: heroSection,
    engine: engine,
    options: {
        width: heroSection.clientWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

// Run the renderer
Render.run(render);

// Create runner to run the engine
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

// Function to create blocks that fall from a specified width at the top center
function createContributionBlocks(numberOfBlocks, blockWidth, blockHeight, fallWidth) {
    // Adjust block size for mobile devices
    const isMobile = window.innerWidth < 480;
    const mobileBlockWidth = blockWidth * 0.7; // 30% smaller on mobile
    const mobileBlockHeight = blockHeight * 0.7; // 30% smaller on mobile

    for (let i = 0; i < numberOfBlocks; i++) {
        const x = heroSection.clientWidth / 2 + (Math.random() - 0.5) * fallWidth;
        const y = -blockHeight - Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const block = Bodies.rectangle(x, y, isMobile ? mobileBlockWidth : blockWidth, isMobile ? mobileBlockHeight : blockHeight, {
            isStatic: false,
            restitution: 0.8,
            friction: 0.05,
            chamfer: { radius: 5 },
            render: {
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 0
            }
        });
        setTimeout(() => {
            World.add(engine.world, block);
        }, Math.random() * 1200);
    }
}


// Add ground to contain the blocks at the bottom
let groundWidth = calculateGroundWidth(); // Use function to set initial ground width
let ground = Bodies.rectangle(heroSection.clientWidth / 2, heroSection.clientHeight, groundWidth, 60, {
    isStatic: true,
    render: { visible: false }
});
World.add(engine.world, ground);

// Function to update ground width
function updateGroundWidth(newWidth) {
    // Remove the old ground from the world
    World.remove(engine.world, ground);

    // Create a new ground with the updated width
    ground = Bodies.rectangle(heroSection.clientWidth / 2, heroSection.clientHeight, newWidth, 60, {
        isStatic: true,
        render: { visible: false }
    });

    // Add the new ground to the world
    World.add(engine.world, ground);
}

// Add the blocks to the world, reduce number to 200
createContributionBlocks(200, 20, 20, 100);

// Handle window resizing with a delay for consistent behavior across browsers
window.addEventListener('resize', function() {
    setTimeout(() => {
        render.canvas.width = heroSection.clientWidth;
        render.canvas.height = window.innerHeight;

        // Calculate new ground width based on the viewport width
        const newGroundWidth = calculateGroundWidth();
        updateGroundWidth(newGroundWidth);
    }, 100); // 100 milliseconds delay
});

///////////Cont graph

const contributions = [
    { date: "2023-02-27", count: 0 },
    { date: "2023-02-28", count: 0 },
    { date: "2023-03-01", count: 0 },
    { date: "2023-03-02", count: 0 },
    { date: "2023-03-03", count: 0 },
    { date: "2023-03-04", count: 0 },
    { date: "2023-03-05", count: 0 },
    { date: "2023-03-06", count: 0 },
    { date: "2023-03-07", count: 0 },
    // Add more data points as needed
  ];

  // Dimensions and margins for the graph
  const width = 960,
        height = 136,
        cellSize = 17; // cell size

  const format = d3.timeFormat("%Y-%m-%d");

  const timeWeek = d3.utcSunday;
  const countDay = d => (d.getUTCDay() + 6) % 7;
  const timeWeeks = d3.utcWeek.range(d3.utcYear(new Date()), new Date());

  // SVG container
  const svg = d3.select("#contribution-graph")
    .selectAll("svg")
    .data(d3.range(2023, 2024))
    .join("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .append("g")
      .attr("transform", "translate(32,20)");

  svg.append("text")
    .attr("x", width - 5)
    .attr("y", -5)
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(d => d);

  const rect = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .selectAll("rect")
    .data(d => d3.utcDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
    .join("rect")
      .attr("width", cellSize - 1.5)
      .attr("height", cellSize - 1.5)
      .attr("x", (d, i) => (countDay(d) + timeWeek.count(d3.utcYear(d), d)) * cellSize + 0.5)
      .attr("y", d => countDay(d) * cellSize + 0.5)
      .datum(format);

  const data = contributions.reduce((map, {date, count}) => {
    map[date] = count;
    return map;
  }, {});

  rect.filter(d => d in data)
    .attr("fill", d => d3.interpolateRdYlGn(data[d] / 10))
    .append("title")
    .text(d => `${d}: ${data[d]}`);

  // Add month borders
  const month = svg.selectAll("g")
    .data(d => d3.utcMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
    .join("g");

  month.filter((d, i) => i).append("path")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .attr("d", d => `M${(timeWeek.count(d3.utcYear(d), d) + 0.5) * cellSize},0V${7 * cellSize}`);