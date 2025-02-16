(function () {
    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main Functions
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = { x: width / 2, y: height / 2 };

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height + 'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // Create points
        points = [];
        for (var x = 0; x < width; x += width / 20) {
            for (var y = 0; y < height; y += height / 20) {
                var px = x + Math.random() * width / 20;
                var py = y + Math.random() * height / 20;
                var p = { x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // Find closest points
        for (var i = 0; i < points.length; i++) {
            var p1 = points[i];
            var sortedPoints = points
                .filter(p2 => p1 !== p2)
                .sort((p2a, p2b) => getDistance(p1, p2a) - getDistance(p1, p2b));

            p1.closest = sortedPoints.slice(0, 5);
        }

        // Assign a circle to each point
        for (var i in points) {
            var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event Handling
    function addListeners() {
        if (!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = 0, posy = 0;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        animateHeader = document.body.scrollTop <= height;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;
    }

    // Animation
    function initAnimation() {
        animate();
        for (var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in points) {
                var distance = getDistance(target, points[i]);

                if (distance < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if (distance < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if (distance < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        gsap.to(p, {
            duration: 1 + Math.random(),
            x: p.originX - 50 + Math.random() * 100,
            y: p.originY - 50 + Math.random() * 100,
            ease: "power2.inOut",
            onComplete: function () {
                shiftPoint(p);
            }
        });
    }

    // Canvas Drawing
    function drawLines(p) {
        if (!p.active) return;
        for (var i in p.closest) {
            if (!p.closest[i]) continue; // Prevent errors

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
            ctx.stroke();
        }
    }

    function Circle(pos, rad, color) {
        this.pos = pos || null;
        this.radius = rad || null;
        this.color = color || null;

        this.draw = function () {
            if (!this.active) return;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(156,217,249,' + this.active + ')';
            ctx.fill();
        };
    }

    // Utility Function
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
})();
