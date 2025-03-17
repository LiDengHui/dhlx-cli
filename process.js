export default {
    file: './input.xlsx',
    out: './output.xlsx',
    key: ['id', 'category'],
    baseValue: '1',
    compareValue: '2',
    merge(groupKey, items) {
        const first = items[0];
        first['count'] = items.reduce((a, b) => (b['count'] || 0) + a, 0);

        return first;
    },
    result(groupKey, baseData = {}, compareData = {}) {
        // console.log(groupKey, baseData, compareData)
        return {};
    },
};
