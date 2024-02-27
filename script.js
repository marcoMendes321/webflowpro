<script>
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
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const endDate = new Date();

    // Generate a year's worth of contribution data
    const contributions = generateContributions(startDate, endDate);

    processAndRenderGraph(contributions);

    function generateContributions(start, end) {
        let contributions = [];
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            let count = Math.random() < 0.1 ? null : Math.floor(Math.random() * 101); // 10% chance of null, otherwise random between 0-100
            contributions.push({
                date: formatDate(dt),
                count: count
            });
        }
        return contributions;
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function processAndRenderGraph(contributions) {
        const cellSize = 12; // Size of the square
        const width = 53 * (cellSize + 1) + 1; // Full width of the graph
        const height = 7 * (cellSize + 1) + 1; // Full height of the graph

        const svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'contribution-graph')
            .style('background', '#fff');

        const colorScale = d3.scaleQuantize()
            .domain([0, d3.max(contributions, d => d.count)])
            .range(['#ebf4fa', '#c2e0f4', '#95cced', '#68b7e1', '#3aa1d8']); // Define your color range here

        const contributionMap = new Map(contributions.map(d => [d.date, d.count]));

        svg.selectAll('.day')
            .data(contributions)
            .enter().append('rect')
            .attr('class', 'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', d => (new Date(d.date).getDay()) * (cellSize + 1))
            .attr('y', d => (d3.timeWeek.count(d3.timeYear(startDate), new Date(d.date))) * (cellSize + 1))
            .attr('fill', d => d.count === null ? '#ebedf0' : colorScale(d.count))
            .append('title')
            .text(d => `${d.date}: ${d.count === null ? 'No contributions' : d.count + ' contributions'}`);
    }
});
</script>



