const Utils = (function() {
	let self = {
		/* take a given value, and a given range and maps the value between given range, can also be used as linear interpolation and extrapolation */
		map: function(num, numMin, numMax, mapMin, mapMax) {
			return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
		},
		/* gives the direction something faces given 2 points */
		direction: function(originX, originY, pointingX, pointingY) {
			return Math.atan2(pointingY - originY, pointingX - originX);
		},
		/* gives the true euler distance between 2 points */
		dist: function(x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		},
		/* gives the distance without using square root for perfomance */
		fastDist: function(x1, y1, x2, y2) {
			return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
		},
		/* as the name says, returns a random floating point number between a given range*/
		randomRange: function(min, max) {
			return min + Math.random() * (max - min);
		},
		/* pads a string with a given character up to a given length, prepend true means the padding will be added before the original string*/
		pad: function(string, length, paddingCharacter, prepend) {
			/* convert to string first as the length property is needed */
			string = string.toString();
			paddingCharacter = paddingCharacter.toString();
			let paddingString = "";
			let paddingLength = length - string.length;
			for (let i = 0; i < paddingLength; i++) {
				paddingString += paddingCharacter;
			}
			if (prepend) {
				return paddingString + string;
			} else {
				return string + paddingString;
			}
		},
		/*	
		 *	given a number, min and max, returns the number if it is within the range
		 *	returns the number, if above the max, returns max, and below min returns min
		 */
		clampRange: function(number, min, max) {
			let newNumber = Math.max(number, min);
			newNumber = Math.min(newNumber, max);
			return newNumber;
		},
		/* converts camelCase names to dash names for use in the HTML dom */
		camelCaseToDash: function(string) {
			return string.replace(/(^[A-Z])/, ([first]) => first.toLowerCase()).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`)
		},
		/* converts dash strings from the dom to camel case for variable names */
		dashToCamelCase: function(string) {
			let split = string.split("-");
			let output = split[0];
			for (let i = 1; i < split.length; i++) {
				output += self.capitaliseFirstLetter(split[i]);
			}
			return output;
		},
		/* internal captitalisation method */
		capitaliseFirstLetter: function(string) {
			return string[0].toUpperCase() + string.slice(1);
		},
		/* rounds a numebr to a specified decimal place, negative numbers give the effect of integer place value rounding (sig figs) */
		roundDecimals: function(number, decimals) {
			if (decimals === undefined) {
				decimals = 0;
			}
			if (decimals > 16) {
				decimals = 16;
			}
			return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
		},
		randomString: function(length) {
			return self.randomStringFromLetters(length, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
		},
		randomAlphaNumericString: function(length) {
			return self.randomStringFromLetters(length, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
		
		},
		randomStringFromLetters(length, letters) {
			let output = "";
			let cacheLength = letters.length - 1;
			for (let i = 0; i < length; i++) {
				output += letters[Math.round(self.randomRange(0, cacheLength))];
			}
			return output;
		},
	};
	return self;
})();