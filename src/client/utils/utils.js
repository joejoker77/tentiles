export default {
    formatDate : function (timestamp) {
        let a = new Date(timestamp * 1000),
            months       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            year         = a.getFullYear(),
            month        = months[a.getMonth()],
            date         = a.getDate(),
            hour         = a.getHours(),
            min          = a.getMinutes();
        return this.formatTimeNumber(date) + ' ' + month + ' ' + year + ' ' + this.formatTimeNumber(hour) + ':' +
            this.formatTimeNumber(min);
    },
    formatAddress: function (address) {
        return address.substr(0, 10) + "...";
    },
    formatAddressLong: function (address) {
        return address.substr(0, 10) + "..." + address.substr(-3);
    },
    formatTimeNumber: function (value) {
        return value < 10 ? '0' + value : value;
    },
    addressToProductId: function (address) {
        return address.replace('0x', '0x000000000000000000000000');
    },
    productIdToAddress: function (productId) {
        return productId.replace('0x000000000000000000000000', '0x');
    },
    stringToBytes32: function (n, reverse) {
        reverse  = reverse || false;
        let base = n;
        while (n.length < 64) {
            n = n + "0";
        }
        if(reverse){
            let remnant = n.replace(base, '');
            n = remnant + base;
        }
        return "0x" + n;
    },
    hexToAscii: function (hex) {
        if (!(typeof hex === 'number' || typeof hex === 'string')) {
            return ''
        }
        hex = hex.toString().replace(/\s+/gi, '');
        const stack = [];
        for (let i = 0; i < hex.length; i += 2) {
            const code = parseInt(hex.substr(i, 2), 16);
            if (!isNaN(code) && code !== 0) {
                stack.push(String.fromCharCode(code))
            }
        }
        return stack.join('')
    },
    capitalizeFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },
    convertToHex: function (str,delim) {
        return str.split("").map(function(c) {
            return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(delim || "");
    }
}