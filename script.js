class Point {
    constructor(nx, dx, ny, dy) {
        this.nx = nx;
        this.dx = dx;
        this.ny = ny;
        this.dy = dy;
    }

    getX() {
        return `${this.nx}/${this.dx}`;
    }

    getY() {
        return `${this.ny}/${this.dy}`;
    }

    getRealX() {
        if(this.dx == 0){
            return 0;
        }
        if(this.dx == 1){
            return 1;
        }
        return this.nx / this.dx;
    }

    getRealY() {
        if(this.dy == 0){
            return 0;
        }
        if(this.dy == 1){
            return 1;
        }
        return this.ny / this.dy;
    }
}


const StepType = {
    PINCH: "PINCH",
    CREASE: "CREASE",
    SUBDIVIDE_RIGHT: "SUBDIVIDE_RIGHT",
    SUBDIVIDE_ABOVE: "SUBDIVIDE_ABOVE",
    MIDPOINT_CREASE: "MIDPOINT_CREASE",
    SUBDIVIDE_ABOVE_CREASE: "SUBDIVIDE_ABOVE_CREASE",
    SUBDIVIDE_FULL: "SUBDIVIDE_FULL"
};


class Step {
    constructor(type, message, point = null, point2 = null, direction = "", N, a) {
        this.type = type;
        this.message = message;
        this.point = point;
        this.point2 = point2;
        this.direction = direction;
        this.N = N;
        this.a = a;
    }

    // Equivalent to Step(int level, int a, int N, Point p)
    static subdivideWithPoint(level, a, N, p) {
        let type;
        let message;
        let point = p;
        let point2 = null;

        if (level === 0) {
            type = StepType.SUBDIVIDE_FULL;
            message = "Fold in half repeatedly to obtain desired grid.";

        } else if (level === 1) {
            type = StepType.SUBDIVIDE_RIGHT;
            message =
                "Using the new intersection point as reference, subdivide the right part into "
                + (N - a) + " sections.";

        } else if (level === 2) {
            type = StepType.SUBDIVIDE_ABOVE;
            message =
                "Using the same intersection point as reference, subdivide the "
            if(p.getRealY() > 0.5){
                message += " lower ";
            }else{
                message += " upper ";
            }
            
            message += "part into  " + (N - a) + " sections.";

        } else if (level === 3) {
            type = StepType.MIDPOINT_CREASE;
            message =
                "Using the same intersection point as reference, fold the bottom edge up to touch it and make a horizontal crease.";

            point = new Point(0, 0, p.ny/2, p.dy);
            point2 = new Point(1, 1, p.ny/2, p.dy);

        } else if (level === 4) {
            type = StepType.SUBDIVIDE_ABOVE_CREASE;
            message =
                "Using the new crease as reference, fold the upper part into "
                + (N - a) + " sections.";
            point = p;
            point2 = new Point(1, 1, p.ny/2, p.dy);
        } else if (level === 5) {
            type = StepType.SUBDIVIDE_FULL;
            message =
                "Subdivide the remaining grid using what you have already folded.";
        }

        return new Step(type, message, point, point2, "", N, a);
    }


    // Equivalent to Step(Point p, Point p2)
    static crease(p, p2) {
        let message = "Make a crease from the ";

        message += Step.describePoint(p);

        message += "to the ";

        message += Step.describePoint(p2);

        return new Step(
            StepType.CREASE,
            message,
            p,
            p2,
            ""
        );
    }


    // Equivalent to Step(Point p)
    static pinch(p) {
        let direction;
        let message;

        if (p.dx === 0) {

            direction = "RIGHT";

            message = "Along the left edge, fold the ";

            if (p.ny === 1) {

                message += "bottom left corner to the ";

                if (p.dy === 2) {
                    message += "top left corner";
                } else {
                    message +=
                        "mark at " +
                        new Point(0, 0, 1, p.dy / 2).getY();
                }

            } else {

                message +=
                    "mark at " +
                    new Point(
                        0,
                        0,
                        (p.ny - 1) / 2,
                        p.dy / 2
                    ).getY();

                message +=
                    " to the mark at " +
                    new Point(
                        0,
                        0,
                        (p.ny + 1) / 2,
                        p.dy / 2
                    ).getY();
            }

            message +=
                " to make the " +
                p.getY() +
                " mark.";

        } else {

            direction = "DOWN";

            message = "Along the top edge, fold the ";

            if (p.nx === 1) {

                message += "top right corner to the ";

                if (p.dx === 2) {
                    message += "top left corner";
                } else {
                    message +=
                        "mark at " +
                        new Point(
                            0,
                            0,
                            p.dx / 2,
                            1
                        ).getX();
                }

            } else {
                message += "mark at " + new Point((p.nx - 1)/2,p.dx/2, 0,0).getX();
                message += " to the mark at " + new Point((p.nx + 1)/2,p.dx/2, 0,0).getX();
            }

            message +=
                " to make the " +
                p.getX() +
                " mark.";
        }

        return new Step(
            StepType.PINCH,
            message,
            p,
            null,
            direction
        );
    }


    // Equivalent to the repeated corner/edge logic
    // in your Java crease constructor.
    static describePoint(p) {

        if (p.dx === 0 && p.dy === 0) {
            return "bottom left corner ";
        }

        if (
            p.dx === 0 &&
            p.dy === 1 &&
            p.ny === 1
        ) {
            return "top left corner ";
        }

        if (
            p.dx === 1 &&
            p.nx === 1 &&
            p.dy === 0
        ) {
            return "bottom right corner ";
        }

        if (
            p.dx === 1 &&
            p.nx === 1 &&
            p.dy === 1 &&
            p.ny === 1
        ) {
            return "top right corner ";
        }

        let message = "mark along the ";

        if (p.dx === 0) {
            message +=
                "left edge at " +
                p.getY() +
                " ";
        } else {
            message +=
                "top edge at " +
                p.getX() +
                " ";
        }

        return message;
    }
}

function countBits(n) {
    let count = 0;

    while (n > 0) {
        count += n & 1;
        n >>= 1;
    }

    return count;
}

function generateGrid(N) {

    let out = [];
    let n = N;

    // POWER OF TWO
    if (countBits(n) === 1) {
        out.push(
            Step.subdivideWithPoint(0, -1, N, null)
        );

        return out;
    } else {

        while (n % 2 === 0) {
            n /= 2;
        }
    }


    // FIND THE GREATEST POWER OF TWO UNDER n

    let Po2 = 1;

    while (Po2 * 2 < n) {
        Po2 *= 2;
    }


    // OPTIMIZE FOR GREATEST ANGLES AND LEAST SUBDIVISIONS

    let shrank = false;

    let mark = n - Po2;

    let diff = Po2 * 2 - n;

    if (diff > n-Po2) {
        Po2 /= 2;
        shrank = true;
    }


    // FIRST POINT TO FIND

    if (shrank) {

        out.push(
            Step.pinch(
                new Point(1, 2, 1, 1)
            )
        );

        out.push(
            Step.crease(
                new Point(0, 0, 0, 0),
                new Point(1, 2, 1, 1)
            )
        );

    } else {

        out.push(
            Step.crease(
                new Point(0, 0, 0, 0),
                new Point(1, 1, 1, 1)
            )
        );
    }


    // SECOND POINT TO FIND

    let lowN = 0;
    let highN = 2;

    for (let i = 2; i <= Po2; i *= 2) {

        let midN = (lowN + highN) / 2;

        out.push(
            Step.pinch(
                new Point(0, 0, midN, i)
            )
        );

        if (mark * i < Po2 * midN) {
            highN = midN;
        } else {
            lowN = midN;
        }

        lowN *= 2;
        highN *= 2;
    }


    // CREASE FROM SECOND POINT TO BOTTOM RIGHT

    out.push(
        Step.crease(
            new Point(0, 0, mark, Po2),
            new Point(1, 1, 0, 0)
        )
    );


    // FINAL SUBDIVISION STEPS

    let scale = N / n;
    let intersectionPoint = new Point(scale*mark, N, scale*mark, N);
    if(shrank){
        intersectionPoint = new Point(scale*mark, N, 2*scale*mark, N);
    }

    out.push(
        Step.subdivideWithPoint(1,scale * mark,N, intersectionPoint)
    );

    if (shrank) {

        out.push(
            Step.subdivideWithPoint(
                3,
                scale * mark,
                N,
                intersectionPoint
            )
        );

        out.push(
            Step.subdivideWithPoint(
                4,
                scale * mark,
                N, intersectionPoint
            )
        );

    } else {

        out.push(
            Step.subdivideWithPoint(
                2,
                scale * mark,
                N, intersectionPoint
            )
        );
    }


    // FINAL FULL GRID

    out.push(
        Step.subdivideWithPoint(
            5,
            -1,
            N, null
        )
    );

    return out;
}

function displaySteps(steps) {

    const stepsContainer = document.getElementById("steps");

    stepsContainer.innerHTML = "";

    steps.forEach((step, index) => {

        const stepElement = document.createElement("div");

        stepElement.classList.add("step");

        stepElement.innerHTML = `
            <div class="step-number">${index + 1}</div>
            <div class="step-message">${step.message}</div>
        `;

        stepElement.addEventListener("mouseenter", () => {
            renderSteps(steps, index);
        });

        stepElement.addEventListener("mouseleave", () => {
            renderSteps(steps);
        });

        stepsContainer.appendChild(stepElement);
    });
}

const gridSizeInput = document.getElementById("gridSize");
const numberWheel = document.getElementById("numberWheel");
const wheelTrack = document.getElementById("wheelTrack");

let selectedNumber = 2;

const MIN_NUMBER = 2;
const MAX_NUMBER = 1000;
const ITEM_HEIGHT = 50;

function updateNumberWheel(animate = true) {

    const items = wheelTrack.querySelectorAll(".wheel-item");

    items.forEach((item, index) => {

        const number = MIN_NUMBER + index;
        const distance = Math.abs(number - selectedNumber);

        item.classList.remove("selected");

        if (number === selectedNumber) {
            item.classList.add("selected");
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
        }
        else if (distance === 1) {
            item.style.opacity = "0.45";
            item.style.transform = "scale(0.9)";
        }
        else if (distance === 2) {
            item.style.opacity = "0.25";
            item.style.transform = "scale(0.8)";
        }
        else if (distance === 3) {
            item.style.opacity = "0.12";
            item.style.transform = "scale(0.75)";
        }
        else {
            item.style.opacity = "0";
            item.style.transform = "scale(0.7)";
        }
    });

    const selectedItem =
        wheelTrack.querySelector(".selected");

    if (!selectedItem) return;

    const wheelCenter = numberWheel.clientHeight / 2;

const itemCenter =
    selectedItem.offsetTop +
    selectedItem.offsetHeight / 2;

const offset = wheelCenter - itemCenter;

    wheelTrack.style.transition =
        animate
            ? "transform 0.25s ease-out"
            : "none";

    wheelTrack.style.transform =
        `translateY(${offset}px)`;

    gridSizeInput.value = selectedNumber;
}

function initializeNumberWheel() {

    wheelTrack.innerHTML = "";

    for (let n = MIN_NUMBER; n <= MAX_NUMBER; n++) {

        const item = document.createElement("div");

        item.classList.add("wheel-item");

        item.textContent = n;

        wheelTrack.appendChild(item);
    }

    updateNumberWheel(false);
}

selectedNumber = Number(gridSizeInput.value);
initializeNumberWheel();

let scrollAccumulator = 0;

numberWheel.addEventListener("wheel", (event) => {
    event.preventDefault();

    scrollAccumulator += event.deltaY;

    const threshold = 150;

    if (Math.abs(scrollAccumulator) >= threshold) {

        const direction = scrollAccumulator > 0 ? 1 : -1;

        selectedNumber += direction;

        // Keep between 2 and 1000
        selectedNumber = Math.max(
            MIN_NUMBER,
            Math.min(MAX_NUMBER, selectedNumber)
        );

        // Keep the hidden input synchronized
        gridSizeInput.value = selectedNumber;

        // Redraw the wheel
        updateNumberWheel(true);

        // Generate the new grid immediately
        const generatedSteps = generateGrid(selectedNumber);
        displaySteps(generatedSteps);
        renderSteps(generatedSteps);
        updateGridInfo(generatedSteps);

        // Reset accumulator
        scrollAccumulator = 0;
    }
}, { passive: false });

// =========================================================
// DRAGGING THE NUMBER WHEEL
// =========================================================

let isDraggingWheel = false;
let dragStartY = 0;
let dragStartOffset = 0;

numberWheel.addEventListener("pointerdown", (event) => {
    isDraggingWheel = true;

    dragStartY = event.clientY;

    // Get the current transform position
    const transform = wheelTrack.style.transform;
    const match = transform.match(/translateY\((-?[\d.]+)px\)/);

    dragStartOffset = match
        ? parseFloat(match[1])
        : 0;

    numberWheel.setPointerCapture(event.pointerId);

    event.preventDefault();

    wheelTrack.style.transition = "none";
});


numberWheel.addEventListener("pointermove", (event) => {

    if (!isDraggingWheel) return;

    const mouseMovement = event.clientY - dragStartY;

    // Move the numbers exactly with the mouse
    const newOffset = dragStartOffset + mouseMovement;

    wheelTrack.style.transform =
        `translateY(${newOffset}px)`;

    // Determine which number is now in the center
    const items = wheelTrack.querySelectorAll(".wheel-item");

    const wheelCenter = numberWheel.clientHeight / 2;

    let closestNumber = selectedNumber;
    let closestDistance = Infinity;

    items.forEach((item, index) => {

        const number = MIN_NUMBER + index;

        const itemCenter =
            item.offsetTop +
            item.offsetHeight / 2 +
            newOffset;

        const distance =
            Math.abs(itemCenter - wheelCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestNumber = number;
        }
    });

    // Update the selected number
    if (closestNumber !== selectedNumber) {

        selectedNumber = closestNumber;

        gridSizeInput.value = selectedNumber;

        const generatedSteps =
            generateGrid(selectedNumber);

        displaySteps(generatedSteps);
        renderSteps(generatedSteps);
        updateGridInfo(generatedSteps);
    }

    // Update visual emphasis without repositioning the wheel
    updateNumberWheelVisuals();
});


numberWheel.addEventListener("pointerup", (event) => {

    if (!isDraggingWheel) return;

    isDraggingWheel = false;

    numberWheel.releasePointerCapture(event.pointerId);

    // Snap the selected number perfectly into the center
    updateNumberWheel(true);
});


numberWheel.addEventListener("pointercancel", () => {

    if (!isDraggingWheel) return;

    isDraggingWheel = false;

    updateNumberWheel(true);
});

function updateNumberWheelVisuals() {

    const items = wheelTrack.querySelectorAll(".wheel-item");

    items.forEach((item, index) => {

        const number = MIN_NUMBER + index;
        const distance =
            Math.abs(number - selectedNumber);

        item.classList.remove("selected");

        if (number === selectedNumber) {

            item.classList.add("selected");
            item.style.opacity = "1";
            item.style.transform = "scale(1)";

        } else if (distance === 1) {

            item.style.opacity = "0.45";
            item.style.transform = "scale(0.9)";

        } else if (distance === 2) {

            item.style.opacity = "0.25";
            item.style.transform = "scale(0.8)";

        } else if (distance === 3) {

            item.style.opacity = "0.12";
            item.style.transform = "scale(0.75)";

        } else {

            item.style.opacity = "0";
            item.style.transform = "scale(0.7)";
        }
    });
}

function toSVGX(point) {
    return point.getRealX() * 1000;
}

function toSVGY(point) {
    return (1 - point.getRealY()) * 1000;
}

function drawCrease(svg, point1, point2, highlighted = false) {

    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.setAttribute("x1", toSVGX(point1));
    line.setAttribute("y1", toSVGY(point1));

    line.setAttribute("x2", toSVGX(point2));
    line.setAttribute("y2", toSVGY(point2));

    line.setAttribute(
        "stroke",
        highlighted ? "#e63946" : "#222"
    );

    line.setAttribute(
        "stroke-width",
        highlighted ? "8" : "5"
    );

    line.setAttribute("stroke-linecap", "round");

    svg.appendChild(line);
}

function drawPinch(svg, point, direction, highlighted = false) {

    const x = toSVGX(point);
    const y = toSVGY(point);

    const length = 20;

    let x2 = x;
    let y2 = y;

    if (direction === "RIGHT") {
        x2 += length;
    }

    if (direction === "DOWN") {
        y2 += length;
    }

    
    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.setAttribute("x1", x);
    line.setAttribute("y1", y);

    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);

    line.setAttribute(
        "stroke",
        highlighted ? "#e63946" : "#222"
    );

    line.setAttribute(
        "stroke-width",
        highlighted ? "8" : "6"
    );

    line.setAttribute("stroke-linecap", "round");

    svg.appendChild(line);
}

function renderSteps(steps, hoveredStep = null) {

    const svg = document.getElementById("paper");

    // Remove everything except the paper itself
    while (svg.children.length > 1) {
    svg.removeChild(svg.lastChild);
}

const oldDefs = svg.querySelector("defs");

if (oldDefs) {
    oldDefs.remove();
}

    const visibleCount =
        hoveredStep === null
            ? steps.length
            : hoveredStep + 1;

    for (let i = 0; i < visibleCount; i++) {

        const step = steps[i];

        const highlighted =
            hoveredStep === i;

        if (step.type === StepType.CREASE) {
            drawCrease(
                svg,
                step.point,
                step.point2,
                highlighted
            );
            
        } else if (step.type === StepType.PINCH) {
            drawPinch(
                svg,
                step.point,
                step.direction,
                highlighted
            );
        }else if (step.type === StepType.SUBDIVIDE_RIGHT) {

    drawSubdivisionRight(
        svg,
        step,
        step.N-step.a
    );

} else if (step.type === StepType.SUBDIVIDE_ABOVE) {

    drawSubdivisionAbove(
        svg,
        step,
        step.N-step.a
    );

}else if (step.type === StepType.MIDPOINT_CREASE) {

    drawCrease(
        svg,
        step.point,
        step.point2,
        highlighted
    );

}else if (step.type === StepType.SUBDIVIDE_ABOVE_CREASE) {

    drawSubdivisionAboveCrease(
        svg,
        step,
        step.N, step.a
    );

}else if (step.type === StepType.SUBDIVIDE_FULL) {

    drawFullGrid(svg, step.N);

}

        
    }
}

function drawGrid(svg, N, xStart, xEnd, yStart, yEnd) {

    const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    group.setAttribute("class", "subdivision-grid");

    // Vertical lines
    for (let i = 0; i <= N; i++) {

        const x =
            xStart + (xEnd - xStart) * (i / N);

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", x);
        line.setAttribute("y1", yStart);

        line.setAttribute("x2", x);
        line.setAttribute("y2", yEnd);

        line.setAttribute("stroke", "#999");
line.setAttribute("stroke-width", "2");

        svg.appendChild(line);
    }

    // Horizontal lines
    for (let i = 0; i <= N; i++) {

        const y =
            yStart + (yEnd - yStart) * (i / N);

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", xStart);
        line.setAttribute("y1", y);

        line.setAttribute("x2", xEnd);
        line.setAttribute("y2", y);

        line.setAttribute("stroke", "#999");
line.setAttribute("stroke-width", "2");

        svg.appendChild(line);
    }
}

function drawSubdivisionRight(svg, step, N) {

    const xStart = toSVGX(step.point);
    const xEnd = 1000;

    const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    group.setAttribute("class", "subdivision-grid");

    for (let i = 0; i <= N; i++) {

        const x = xStart + (xEnd - xStart) * (i / N);

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", x);
        line.setAttribute("y1", 0);
        line.setAttribute("x2", x);
        line.setAttribute("y2", 1000);

        line.setAttribute("stroke", "#999");
        line.setAttribute("stroke-width", "2");

        svg.appendChild(line);
    }
}

function drawSubdivisionAbove(svg, step, N) {

    const x = toSVGX(step.point);
    const y = toSVGY(step.point);

    // Keep the vertical lines from SUBDIVIDE_RIGHT
    for (let i = 0; i <= N; i++) {

        const currentX = x + (1000 - x) * (i / N);

        const vertical = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        vertical.setAttribute("x1", currentX);
        vertical.setAttribute("y1", 0);
        vertical.setAttribute("x2", currentX);
        vertical.setAttribute("y2", 1000);

        vertical.setAttribute("stroke", "#999");
        vertical.setAttribute("stroke-width", "2");

        svg.appendChild(vertical);
    }

    // Add horizontal lines above the intersection
    for (let i = 0; i <= N; i++) {

        const currentY = y * (1 - i / N);

        const horizontal = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        horizontal.setAttribute("x1", 0);
        horizontal.setAttribute("y1", currentY);
        horizontal.setAttribute("x2", 1000);
        horizontal.setAttribute("y2", currentY);

        horizontal.setAttribute("stroke", "#999");
        horizontal.setAttribute("stroke-width", "2");

        svg.appendChild(horizontal);
    }
}

function drawSubdivisionAboveCrease(svg, step, N, a) {

    const x = toSVGX(step.point);
    const y = toSVGY(step.point2);

    // Keep the vertical lines from SUBDIVIDE_RIGHT
    for (let i = 0; i <= N-a; i++) {

        const currentX = x + (1000 - x) * (i / (N-a));

        const vertical = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        vertical.setAttribute("x1", currentX);
        vertical.setAttribute("y1", 0);
        vertical.setAttribute("x2", currentX);
        vertical.setAttribute("y2", 1000);

        vertical.setAttribute("stroke", "#999");
        vertical.setAttribute("stroke-width", "2");

        svg.appendChild(vertical);
    }

    // Add horizontal lines above the intersection
    for (let i = 0; i <= N-a; i++) {

        const currentY = y * (1 - i / (N-a));

        const horizontal = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        horizontal.setAttribute("x1", 0);
        horizontal.setAttribute("y1", currentY);
        horizontal.setAttribute("x2", 1000);
        horizontal.setAttribute("y2", currentY);

        horizontal.setAttribute("stroke", "#999");
        horizontal.setAttribute("stroke-width", "2");

        svg.appendChild(horizontal);
    }
}

function drawFullGrid(svg, N) {
    drawGrid(
        svg,
        N,
        0,
        1000,
        0,
        1000
    );
}

function updateGridInfo(steps) {
    const gridInfo = document.getElementById("gridInfo");

    if (!gridInfo) return;

    const stepCount = steps.length;

    gridInfo.textContent =
        `${selectedNumber} × ${selectedNumber} GRID · ${stepCount} ${stepCount === 1 ? "STEP" : "STEPS"}`;
}