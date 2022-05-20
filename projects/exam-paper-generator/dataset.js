import {Subject, Paper, Question, SubQuestion} from "./dataStructures.js"

export let data = {
	subjects: [
		new Subject("Mathematics Extension 1", [
			new Paper("Assessment Task 2 - Sample Paper", false, [
				new Question("multiplechoice", "rates of change", "pee pee poo poo", [], ["A", "B", "C", "D"]),
				new Question("multiplechoice", "rates of change", "pee pee poo poo", [], ["A", "B", "C", "D"]),
				new Question("multiplechoice", "rates of change", "pee pee poo poo", [], ["A", "B", "C", "D"]),
				new Question("multiplechoice", "rates of change", "pee pee poo poo", [], ["A", "B", "C", "D"]),
				new Question("multiplechoice", "rates of change", "pee pee poo poo", [], ["A", "B", "C", "D"]),
				new Question("context", "rates of change", "pee pee poo poo", "", [
					new SubQuestion("text", "poo poo"),
					new SubQuestion("text", "poo poo"),
				]),
				new Question("context", "rates of change", "pee pee poo poo", "", [
					new SubQuestion("text", "poo poo"),
					new SubQuestion("text", "poo poo"),
				]),
			]),
			new Paper("2009 3U Prelims - James Ruse", false, [
				new Question("text", "calculus", "Find $dy \\over dx$ if:", [
					new SubQuestion("text", "$y = x^2 sin(3x)$"),
					new SubQuestion("text", "$y = \\sqrt{1 - e^{4x}}$"),
					new SubQuestion("text", "$y = {{x^3} \\over {4 - x^2}}$"),
				]),
				new Question("text", "trigonometry", "Find the exact value of $sin 28^o cos 32^o + sin 32^o cos 28^o$"),
				new Question("text", "inequalities", "Sketch $y = x + |1 - x|$"),
				new Question("text", "proofs", "Prove that the tangent to $y = {x^2 \\over ln(x)}$ at the point where $x = e$ passes through the origin"),
				new Question("text", "trigonometry", "", [
					new SubQuestion("text", "Write down the expansion of $tan(A + B)$"),
					new SubQuestion("text", "Hence using suitable values for $A$ and $B$, prove that $tan 75^o = 2 + \\sqrt{3}$"),
				]),
			]),
			new Paper("2018 3U Prelims - Baulkham Hills", false, [
				new Question("multiplechoice", "polynomials", "Which one of the following expressions represents the factored form of $8x^3 + 27$", [], ["$(2x + 3)(4x^2 + 6x + 9)$", "$(2x + 3)(4x^2 - 6x + 9)$", "$(2x - 3)(4x^2 - 6x - 9)$", "$(2x - 3)(4x^2 + 6x - 9)$"]),
				new Question("multiplechoice", "algebra", "Simplify ${1 + \\sqrt{3}} \\over {2 - \\sqrt{3}}$", [], ["$5 + 3\\sqrt{3}$", "${5 + 3\\sqrt{3}} \\over 7$", "$\\sqrt{3} - 1$", "${\\sqrt{3} - 1} \\over 7$"]),
			]),
			new Paper("2021 3U Prelims - RHHS", false, [
				new Question("multiplechoice", "polynomials", "when $g(x)$ is divided by $x^2 +x - 6$ the remainder is $7x + 13$. What is the remainer when $g(x)$ is divided by $x+3$", [], ["-8", "-5", "34", "55"]),
				new Question("multiplechoice", "polynomials", "Consider the polynomial $P(x) = 3x^3 + 3x + a$. If $x - 2$ is a factor of $P(x)$, what is the value of $a$", [], ["-30", "-18", "18", "30"]),
				new Question("multiplechoice", "polynomials", "Consider the polynomial $P(x) = 2x^3 + x^2 + 2x + a$. If $x - 1$ is a factor of $P(x)$, what is the value of $a$", [], ["-6", "-5", "5", "6"]),
				new Question("multiplechoice", "polynomials", "The polynomial $P(x) = x^4 - kx^3 - 2x + 33$ has $(x - 3)$ as a factor. What is the value of $k$", [], ["-5", "-4", "4", "5"]),
				new Question("text", "polynomials", "The polynomial $P(x) = 2x^3 + kx^2 - 6x + 24$, has a remainder of 6 when divided by $(x - 3)$. Find the value of $k$"),
				new Question("text", "polynomials", "Consider the polynomial $P(x) = x^3 - 4x^2 - 3x + 18$", [
					new SubQuestion("text", "Show that -2 is a zero of $P(x)$"),
					new SubQuestion("text", "Hence factorise $P(x)$ fully."),
					new SubQuestion("graph", "Sketch the graph of y = P(x), showing all important features"),
				]),
				new Question("text", "polynomials", "The polynomial $P(x) = x^3 + px^2 + qx + r$ has real roots $\\sqrt{k}$, $-\\sqrt{k}$ and $a$", [
					new SubQuestion("text", "Find an expression for $a$"),
					new SubQuestion("text", "Show that $ka = r$"),
					new SubQuestion("text", "Show that $pq = r$"),
				]),
				new Question("text", "polynomials", "If $x = 1$ is a double root of the equation $6x^4 - 7x^3 + cx^2 + 13x - 4 = 0$", [
					new SubQuestion("text", "Show that $c = -8$"),
					new SubQuestion("text", "Hence find the other roots"),
				]),
				new Question("text", "polynomials", "The polynomial $P(x) = ax^3 + bx^2 + cx + d$ has roots 0, 3 and -3", [
					new SubQuestion("text", "Find $a, b, c, d$"),
					new SubQuestion("graph", "Sketch the graph $P(x)$"),	
					new SubQuestion("text", "Hence solve the inequality ${x^2 - 9 \\over x} > 0$"),
				]),
				new Question("text", "polynomials", "Consider the equation: $x^3 + 6x^2 - x - 30 = 0$. One of the roots of this equation is equal to the sum of the other two roots. Find the values of the 3 roots"),
				new Question("text", "polynomials", "If two roots of the equation $x^3 + qx + r = 0$ are equal, show that $4q^3 + 27r^2 = 0$"),
				new Question("text", "polynomials", "if $\\alpha$ and $\\beta$ are the roots of $2x^2 + 4x + 1 = 0$, find the value of:", [
					new SubQuestion("text", "$\\alpha + \\beta$"),
					new SubQuestion("text", "$\\alpha\\beta$"),
					new SubQuestion("text", "${1 \\over {\\alpha\\beta^2}} + {1 \\over {\\alpha^2\\beta}}$"),
					new SubQuestion("text", "$\\alpha^2 + \\beta^2$"),
				]),
				new Question("text", "algebra", "Simplify ${4^{n + 1} + 4^{n - 1}} \\over {4^{n - 1} + 4^n}$ as far as possible"),
				new Question("text", "polynomials", "Solve: ", [
					new SubQuestion("text", "$|x + 2| > 3$"),
					new SubQuestion("text", "$|x - 2| <= 2x - 3$"),
				]),
				new Question("text", "inequalities", "Solve $|{x + 3 \\over x - 2}| < 3$"),
			]),
			new Paper("Applications of Calculus", false, [
				new Question("text", "calculus", "A spherical balloon is expanding so that the radius, r, is increasing at a csontant 2 cm per second. At what rate is the volume V, increasing when the radius is 8cm"),
				new Question("text", "calculus", "A hot-air balloon is rising straight up from a level field and is detected by a range finder 500m from the lift-off point. At that point, the angle of elevation of the balloon is $\\pi \\over 6$, and the angle is increasing at the rate of 0.1 rad/min. How fast is the baloon rising at that moment?"),
				new Question("text", "calculus", "Wheat is stored in a silo shaped as a cone with the vertex at the bottom, the sloping walls being at an angle of $45^o$ to the horizontal.", [
					new SubQuestion("text", "Show that the volume V of the wheat is given by: $V = {\\pi h^3 \\over 3}$, where $h$ is the height of wheat in the silo."),
					new SubQuestion("text", "If wheat is being drained from the bottom of the silo at 0.1$m^3$/s, find the rate at which the height is decreasing when the area of the top surface is 20$m^2$. Express your answer in cm/s"),
				]),
				new Question("text", "calculus", "The population $P$ of a town increases at a rate proportional to the number by which the town's population exceeds 5000. This can be expressed by the following differential equation: ${dP \\over dt} = k(P - 5000)$. Where $t$ is the time in years and $k$ is some contant", [
					new SubQuestion("text", "Show that $P = 5000 + Ae^{kt}$ is a solution of the equation"),
					new SubQuestion("text", "Initially the population has 8,000 but after 3 years it had increased to 8,500. Find the values of A and k"),
					new SubQuestion("text", "After how many more years will the population reach 15,000"),
				]),
			]),
			new Paper("Maths in Focus - Prelim Ext 1 - Inequalities", false, [
				new Question("multiplechoice", "inequalities", "Solve ${2x \\over x - 2} \\geq 1$", [], ["$-2 < x < 2$", "$-2 \\leq x \\leq 2$", "$x \\leq 2, x > 2$", "$x < -2, x > 2$"]),
				new Question("text", "inequalities", "${-4 \\over x + 3} \\leq 3$"),
				new Question("text", "inequalities", "$|2x - 7| \\geq 1$"),
				new Question("text", "inequalities", "Solve ${x - 3 \\over 7} - {3 \\over 4} > 9$"),
				new Question("text", "inequalities", "Solve $x^2 - 11x + 18 > 0$"),
				new Question("text", "inequalities", "Solve $|3n + 5| > 5$"),
				new Question("text", "inequalities", "Solve ${7t + 4 \\over 3t-8} \\geq -1$"),
				new Question("context", "inequalities", "Solve:", [
					new SubQuestion("text", "$n^2 + 3n \\leq 0$"),
					new SubQuestion("text", "$|2t + 1| \\geq 3$"),
					new SubQuestion("text", "$x^2 + 2x - 8 \\leq 0$"),
				
				]),
				new Question("context", "inequalities", "Solve:", [
					new SubQuestion("text", "$y^2 - 4 > 0$"),
					new SubQuestion("text", "$1 - x^2 \\leq 0$"),
					new SubQuestion("text", "$|4b = 3| \\leq 5$"),
				]),
				new Question("context", "inequalities", "Solve:", [
					new SubQuestion("text", "$x^2 < 2x + 3$"),
					new SubQuestion("text", "$m^2 + m \\geq 6$"),
					new SubQuestion("text", "${2t - 3 \\over t} < 5$"),
				]),
				new Question("context", "inequalities", "Solve:", [
					new SubQuestion("text", "${y + 1 \\over y - 1} > 2$"),
					new SubQuestion("text", "${2 \\over 2n - 4} \\geq 3$"),
					new SubQuestion("text", "${3x - 2 \\over 2x + 1}\\leq -1$"),
				]),
				new Question("text", "inequalities", "Solve $x^2 > a^2$, where $a > 0$"),
				new Question("text", "inequalities", "Solve ${2 \\over x - 1} - {1 \\over x + 1} = 1$"),
				new Question("text", "inequalities", "Solve ${6 - 2y \\over y} \\geq$"),
				new Question("text", "inequalities", "Solve $(x - 4)(x - 1) \\leq 28$"),
				new Question("text", "inequalities", "Solve ${y^2 - 5y + 2 \\over 3y - 2} \\geq y$"),
			]),
			new Paper("Maths in Focus - Prelim Ext 1 - Polynomials", false, [
				new Question("multiplechoice", "polynomials", "If $f(x) = {1 \\over x - 3}$ find $f^{-1}(x):$", [], ["$f^{-1} = {3 \\over x}$", "$f^{-1} = {1 \\over x}$", "$f^{-1} = x - 3$", "$f^{-1} = {1 \\over x + 3}$"]),
				new Question("multiplechoice", "polynomials", "If the roots of the quadratic equation $x^2 + 3x + k - 1 = 0$ are consecutive. evaluate $k$", [], ["$k = -1$", "$k = 1$", "$k = 2$", "$k = 3$"]),
				new Question("text", "polynomials", "Write $p(x) = z^4 + 4x^3 - 14x^2 - 36x + 45$ as a product of its factors"),
				new Question("context", "polynomials", "if $\\alpha, \\beta$ and $\\gamma$ are the roots of $x^3 - 3x^2 + x - 9 = 0$, find:", [
					new SubQuestion("text", "$\\alpha + \\beta + \\gamma$"),
					new SubQuestion("text", "$\\alpha \\beta \\gamma$"),
					new SubQuestion("text", "$\\alpha \\beta + \\alpha \\gamma + \\beta \\gamma$"),
					new SubQuestion("text", "${1 \\over \\alpha} + {1 \\over \\beta} + {1 \\over \\gamma}$"),
				]),
				new Question("text", "polynomials", "Divide $P(x) = x^4 + x^3 - 19x^2 -49x - 30$ by $x^2 - 2x - 15$"),
				new Question("text", "polynomials", "if $ax^4 + 3x^3 - 48x^2 + 60x = 0$ has a double root at $x = 2$, find:", [
					new SubQuestion("text", "the value of a"),
					new SubQuestion("text", "the sum of the other 2 roots"),
				]),
				new Question("text", "polynomials", "Show that $x + 7$ is not a factor of $x^3 - 7x^2 + 5x - 4$"),
				new Question("text", "polynomials", "Given the function $f(x) = x^2 - 4x$", [
					new SubQuestion("text", "Find the domain in which $f(x)$ is monotonically increasing"),
					new SubQuestion("text", "Find the inverse function over this domain"),
					new SubQuestion("text", "Graph both $f(x)$ and $f^{-1}(x)$ on the same axis"),
				]),
				new Question("text", "polynomials", "The polynomial $f(x) = ax^2 + bx + c$ has zeros 4 and 5, f(-1) = 60. Evalute a, b and c"),
				new Question("text", "polynomials", "Prove that $f(f^{-1}(x)) = f^{-1}(f(x)) = x$, using the function $f(x) = {1 \\over x + 3}$"),
				new Question("text", "polynomials", "Given $P(u) = u^3 - 4u^2 + 5u - 2$", [
					new SubQuestion("text", "Write P(u) as a product of its factors"),
					new SubQuestion("text", "Hence or otherwise solve $(u - 1)^3 - 4(u - 1)^2 + 5(u - 1) - 2 = 0$"),
				]),
				new Question("text", "polynomials", "Given $f(u) = u^3 - 13u^2 + 39u - 27$", [
					new SubQuestion("text", "Write P(u) as a product of its factors"),
					new SubQuestion("text", "Hence or otherwise solve $(3^{3x} - 13 \\cdot 3^{2x} + 39 \\cdot 3^{x} - 27 = 0$"),
				]),
				new Question("text", "polynomials", "If $P(x) = ax^3 + bx^2 + cx + d$ has a remainder of 8 when divided by $x - 1$, $P(2) = 17$, $P(-1) = -4$ and $P(0) = 5$, evaluate a, b, c, d"),
			]),
			new Paper("Various Questions", false, [
				new Question("text", "uncatagorised", "1 + 1"),
			]),
			new Paper("Unecessarily Tedious Questions", false, [
				new Question("text", "polynomials", "Divide $x^7 + 6x^6 - 16x^5 - 130x^4 - 21x^3 + 604x^2 + 276x - 720$ by $x^3 - 5x^2 - 4x + 20$, express your answer in the form $P(x) = Q(x)A(x) + R$"),
			]),
			new Paper("Rates involving two or more variables", false, [
				new Question("text", "calculus", "An ice cube is melting so that its edge is decreasing at the rate of 0.5mm/s. At what rate is the surface area decreasing when the edge length is 400mm"),
				new Question("text", "calculus", "A spherical balloon is being inflated and its radius is increaseing at the rate of 2cm / min. At what rate is the volume increasing when the radius of the balloon is 7cm"),
				new Question("text", "calculus", "The volume of water in a hemispherical bowl of radius 10cm is given by $V = {\\pi \\over 3}x^2(30 - x)$"),
				new Question("text", "calculus", "A vessel containing water has the shape of an inverted right circular cone with base radius 2m and height 5m. The water flows from the apex of the cone at a constant rate of 0.2$m^3$/min. Find that rate at which the water level is dropping when the depth of the water is 4m"),
				new Question("text", "calculus", "A ladder 10m long has its upper end against a vertical wall with its lower end of the horizontal ground. THe lower end is slipping away from the wall and a constant speed of 4m/s. Find the rate at which the upper end of the ladder is sliping down the wall when the lower end is 6m from the wall."),
				new Question("text", "calculus", "A ferry wharf consists of a floating pontoon linked to a jerry by a 4 metre long walkway. Let $h$ mertres be the difference in height btween the top of the pontoon and the top of the jetty and let $x$ metres be the horizontal distance between the pontoon and the jetty.", [
					new SubQuestion("text", "Find an expression for $x$ in terms of $h$"),
					new SubQuestion("text", "When the top of the pontoon is 1 metre lower than the top of the jerry the tide is rising at a rate of 0.3 metres per hour. At what rate is the pontoon moving away from the jetty?"),
				]),
				new Question("text", "calculus", "The cross section of a metre tank is an isosceles triangle. The height is 3m and the length is 10m. The size of the obtuse angle is 120 degrees. The top of the tank is horizontal. When the tank is full the depth of the water is 3m. The depth of the water at time t is h metres", [
					new SubQuestion("text", "Find the volume, V, of the water in the tank when the depth is h metres"),
					new SubQuestion("text", "Show that the area, A, of  the top surface of the water is given by $A = 20 \\sqrt{3}h$"),
					new SubQuestion("text", "The rate of evaporation of the water is given by ${dv \\over dt} = -kA$"),
					new SubQuestion("text", "It takes 100 days for the depth to fall from 3m to 2m. Find the time taken for the depth to fall from 2m to 1m"),
				]),
				new Question("text", "calculus", "The rate of increase of a population P of green and purple flying bugs is proportional to the excess of the population over 2000, that is, ${dP \\over dt} = k(P - 2000)$, for some constant k. Initially the population is 3000 and three weeks later the population is 8000.", [
					new SubQuestion("text", "Show that $P = 2000 + Ae^{kt}$ satifies the differential equation, where A is constant."),
					new SubQuestion("text", "By susbstituing t = 0 and t = 3, find the values of A and k"),
					new SubQuestion("text", "Find the population after seven weeks. Correct to the nearest 10 bugs"),
					new SubQuestion("text", "Find when the population reaches 500,000 correct to the nearest 0.1 weeks"),
				]),
			]),
		]),
	],
};