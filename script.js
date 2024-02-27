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
const today = new Date();
const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
const endDate = today;

function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

// Function to process and render the graph
function processAndRenderGraph(contributions) {
    const cellSize = 15;
    const cellMargin = 1.5;
    const cellActualSize = cellSize - cellMargin * 2;
    const paddingLeftRight = 20;
    const width = 53 * cellSize + paddingLeftRight * 2;
    const height = 7 * cellSize + 20;
    const topPadding = 30; // Add some space at the top for month labels
    const paddingLeft = 32;

    const maxContribution = Math.max(...contributions.map(d => d.count));

    function calculateBreakpoints(maxValue) {
        const breakpoints = [1];
        let currentBreakpoint = 1;
        while (currentBreakpoint < maxValue) {
            currentBreakpoint *= 2; // This factor can be adjusted
            breakpoints.push(currentBreakpoint);
        }
        return breakpoints;
    }

    const breakpoints = calculateBreakpoints(maxContribution);

    const colorScale = d3.scaleQuantize()
        .domain([1, maxContribution])
        .range(['#0a377b', '#1058c4', '#5b9af8', '#a1c5fb']);

    const svg = d3.select('.contribution-graph').append('svg')
        .attr('width', width + paddingLeft)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${paddingLeft}, 20)`);

    const contributionMap = new Map(contributions.map(d => [d.date, d.count]));

    const tooltip = d3.select('#tooltip');

    svg.selectAll('.day')
        .data(d3.timeDays(startDate, endDate))
        .enter().append('rect')
            .attr('class', 'day')
            .attr('width', cellActualSize)
            .attr('height', cellActualSize)
            .attr('x', d => {
                const start = d3.timeWeek.floor(startDate);
                return d3.timeWeek.count(start, d) * cellSize + cellMargin;
            })
            .attr('y', d => d.getDay() * cellSize + cellMargin)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', function(d) {
                const formattedDate = d3.timeFormat('%Y-%m-%d')(d);
                const count = contributionMap.get(formattedDate);
                if (count === null) return '#080808';
                if (count === 0) return '#222';
                return colorScale(count);
            })
            .attr('stroke', function(d) {
                const formattedDate = d3.timeFormat('%Y-%m-%d')(d);
                const count = contributionMap.get(formattedDate);
                return count === null ? '#222' : 'none';
            })
            .on('mouseover', (event, d) => {
                const mapFormattedDate = d3.timeFormat('%Y-%m-%d')(d);
                const contributionsCount = contributionMap.get(mapFormattedDate);

                const displayFormattedDate = d3.timeFormat('%b %-d')(d);
                const dayOfMonth = d.getDate();
                const displayDateWithSuffix = displayFormattedDate + getDaySuffix(dayOfMonth);

                let tooltipText;
                if (contributionsCount === null) {
                    tooltipText = `Site Not Registered On ${displayDateWithSuffix}`;
                } else if (contributionsCount !== undefined) {
                    tooltipText = `${contributionsCount} publishes on ${displayDateWithSuffix}`;
                } else {
                    tooltipText = 'No publishes on this date';
                }
                tooltip.style('visibility', 'visible')
                       .style('background', '#444')
                       .style('border', 'none')
                       .text(tooltipText);
            })
            .on('mousemove', (event) => {
                tooltip.style('top', (event.pageY - 10) + 'px')
                       .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', () => {
                tooltip.style('visibility', 'hidden');
            });

    const dayLabels = [
        { day: 'Mon', index: 1 },
        { day: 'Wed', index: 3 },
        { day: 'Fri', index: 5 }
    ];
    dayLabels.forEach(label => {
        svg.append('text')
            .text(label.day)
            .attr('x', -10)
            .attr('y', cellSize * label.index + cellSize / 2)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .attr('style', 'font-size: 10px; fill: #aaa;');
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    svg.selectAll('.month')
        .data(d3.timeMonths(startDate, endDate))
        .enter().append('text')
            .text(d => monthNames[d.getMonth()])
            .attr('x', d => {
                const start = d3.timeWeek.floor(startDate);
                return d3.timeWeek.count(start, d) * cellSize + cellMargin;
            })
            .attr('y', -5)
            .attr('text-anchor', 'start')
            .attr('style', 'font-size: 10px; fill: #aaa;');
}

// Fetch data and call the rendering function
fetch('https://api.github.com/repos/username/repo/stats/commit_activity')
    .then(response => response.json())
    .then(data => {
        const contributions = data.map(week => {
            return week.days.map((dayCount, index) => {
                const date = new Date(week.week * 1000); // Convert UNIX timestamp to JS Date
                date.setDate(date.getDate() + index); // Add day of the week
                let count = dayCount;

                // Customize count for days after first 100 days and before last 100 days
                const daysSinceStart = (date - startDate) / (1000 * 60 * 60 * 24);
                const daysUntilEnd = (endDate - date) / (1000 * 60 * 60 * 24);
                if (daysSinceStart > 100 && daysUntilEnd > 100) {
                    count = Math.floor(Math.random() * 10); // Randomize count
                } else if (daysSinceStart <= 100) {
                    count = 0; // Set count to 0 for first 100 days
                } else if (daysUntilEnd <= 100) {
                    count = null; // Set count to null for last 100 days
                }

                return {
                    date: d3.timeFormat('%Y-%m-%d')(date),
                    count: count
                };
            });
        }).flat();

        processAndRenderGraph(contributions);
    });
</script>


