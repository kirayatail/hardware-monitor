const limit = (min, max, v) => Math.min(max, Math.max(min, v))


/**
 * Linear mapping
 * @param {Number} a lower input bound
 * @param {Number} b higher input bound
 * @param {Number} x lower output bound
 * @param {Number} y higher output bound
 * @param {Number} v input value
 *
 * Maps the input value in relation to the input range,
 * to the output range.
 * Example: You're expecting values between 50 and 200,
 * but you want to transform the values to between 0 and 100.
 * linear(50, 200, 0, 100, input) will do that linearly.
 *
 * Mapped value will not exceed the output bounds, even if the input
 * is outside input range
 *
 * @return {Number} x <= mapped value <= y
 */
const linear = (a,b,x,y,v) => {
  if(x === y) {
    return x;
  }
  return Math.round(limit(x, y, ((v-a) * (y-x)) / (b-a) + x));
}

/**
 * Linear mapping with breakpoints
 * @param { [{in: Number, out: Number}] } breakpoints List of breakpoints
 * @param {Number} v input value
 *
 * Applies multiple connected linear maps defined by input breakpoints.
 * Allows for different gradients between breakpoints, good for truncating
 * values of less interest while maintaining a feeling of linearity.
 *
 * @return {Number} [lowest breakpoint.out] <= v <= [highest breakpoint.out]
 */
const linearWithBreakpoints = (breakpoints, v) => {
  const [lo, hi] = breakpoints.sort((a,b) => {
    if (a.in < b.in) return -1;
    if (a.in > b.in) return 1;
    return 0;
  }).reduce((acc, p, idx, src) => {
    return p.in < v ? [breakpoints[idx], breakpoints[Math.min(idx + 1, src.length -1)]] : acc;
  }, [breakpoints[0], breakpoints[1]]);
  return linear(lo.in, hi.in, lo.out, hi.out, v);
}

module.exports = {
  linear: linear,
  breakpoints: linearWithBreakpoints
};
