const { BigNumber } = require("ethers");
const _ = require("lodash");
function numberWithCommas(x, sep) {
    sep = sep || ','
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1" + sep + "$2");
    return x;
}
function formatBigNumebr(opt) {
    const bn = ethers.utils.formatEther(this)
    let [fullPart, decimalParts] = ('' + bn).split('.')
    decimalParts = _.padEnd(decimalParts, 18, '0')
    fullPart = numberWithCommas(fullPart)
    if (opt && opt.padStart) {
        fullPart = _.padStart(fullPart, opt.padStart, ' ')
    }
    return _.padStart(
        fullPart + "." + numberWithCommas(decimalParts, '-'),
        '10,000.000-000-000-000-000-000'.length, " ")
}
BigNumber.prototype.toMyCustomBigNumber = formatBigNumebr
BigNumber.prototype.toDollar = function (opt) {
    opt = opt || {}
    const ethPrice = _.get(opt, 'price') || 1600
    const multiplied = this.mul(ethPrice)
    const bn = ethers.utils.formatEther(multiplied)
    let [fullPart, decimalParts] = ('' + bn).split('.')
    decimalParts = _.padEnd(decimalParts, 4, '0').substring(0, 4)
    fullPart = numberWithCommas(fullPart)
    if (opt.padStart) {
        fullPart = _.padStart(fullPart, opt.padStart, ' ')
    }
    return fullPart + "." + decimalParts + "$"
}
BigNumber.toBigNumber18 = (x) => {
    const n = `${x}${_.repeat("0", 18)}`
    return BigNumber.from(n)
}