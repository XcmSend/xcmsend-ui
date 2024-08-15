export function constructCallData(pallets, formData, palletName, methodName) {
    console.log(`constructCallData - pallets, formData, palletName, methodName:`, { pallets, formData, palletName, methodName });
    // Find the pallet and method
    const pallet = pallets.find(p => toCamelCase(p.name) === toCamelCase(palletName));
    if (!pallet) throw new Error("Pallet not found");
    const method = pallet.calls.find(m => toCamelCase(m.name) === toCamelCase(methodName));
    if (!method) throw new Error("Method not found");

    const fieldsOrder = method.fields.map(field => field.name);
    const paramsKey = Object.keys(formData.params).find(key => toCamelCase(key).includes(toCamelCase(methodName)));
    if (!paramsKey) throw new Error("Parameters for the method not found in formData");

    const methodParams = formData.params[paramsKey];

    // Map formData to the order specified by metadata and convert keys to camelCase in final mapping
    const callData = fieldsOrder.map(fieldName => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (methodParams.hasOwnProperty(fieldName)) {
            return { [camelCaseFieldName]: methodParams[fieldName] };
        }
        throw new Error(`Missing expected parameter: ${fieldName}`);
    });

    return {
        method: toCamelCase(methodName),
        section: toCamelCase(palletName),
        arguments: callData
    };
}




export function formatCallData(callDataArray) {
    return {
        method: callDataArray.method, 
        section: callDataArray.section, 
        arguments: callDataArray.arguments.map(item => {
            if (typeof item === 'string' || item === null) {
                return item === "" ? null : item;
            }
            else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                const key = Object.keys(item)[0];
                if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
                    return { [key]: { ...item[key] } };
                }
                return { [key]: item[key] }; 
            }
            return item; 
        })
    };
}



export function toCamelCase(str) {
    return str
        .replace(/(_\w)/g, (match) => match[1].toUpperCase())
        .replace(/^([A-Z])/, (match) => match.toLowerCase());
}

// Example usage:
// const callData = constructCallData(formData, "AutomationTime", "schedule_xcmp_task");
// console.log(callData);