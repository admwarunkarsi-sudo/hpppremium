export const CurrencyUtils = {
    format(number, prefix = "Rp ") {
        if (number === null || number === undefined || isNaN(number)) return prefix + "0";
        const rounded = Math.round(number);
        const numberString = rounded.toString().replace(/[^,\d]/g, '');
        const split = numberString.split(',');
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            const separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
        return prefix + rupiah;
    },

    parse(rupiahString) {
        if (!rupiahString) return 0;
        if (typeof rupiahString === 'number') return rupiahString;
        const cleanString = rupiahString.toString().replace(/[^,\d]/g, '');
        return parseInt(cleanString, 10) || 0;
    }
};
