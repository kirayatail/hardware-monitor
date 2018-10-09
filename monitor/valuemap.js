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
  return Math.min(y, Math.max(x, (((v-a) * (y-x)) / (b-a)) + x))
}

module.exports = {
  linear: linear
};