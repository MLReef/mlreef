export const INT = "INT";
export const FLOAT = "FLOAT";
export const BOOL = "Boolean";
export const regExps = {"INT": /^[0-9]+$/, "FLOAT": /^-?\d*\.?\d*$/};
export const errorMessages = {
    INT: "Integer, value must be between 1 - 9999",
    FLOAT: "Required field or float type",
    BOOL: "Required filed or bool type"
};