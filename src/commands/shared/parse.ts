export function parseOptionalInt(value: unknown, optionName: string): number | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const parsedValue = Number.parseInt(String(value), 10);
    if (Number.isNaN(parsedValue)) {
        throw new Error(`Invalid value for option "${optionName}": ${value}`);
    }

    return parsedValue;
}
