import {INT, FLOAT, regExps, STRING } from "../data-types";

export const validateInput = (value, dataType, required) => {
    if(required && (typeof(value) === undefined || value === "")){
        return false;
    }
    
    switch (dataType) {
        case INT:
            return regExps.INT.test(value);
        case FLOAT:
            return regExps.FLOAT.test(value);
        case STRING:
            return (value !== "")
        default:
            return (value === "") || (value === "true") || (value === "false");
    }
};