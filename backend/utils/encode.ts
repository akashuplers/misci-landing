export const encodeURIfix = (str: any) => {
    return encodeURIComponent(str).replace(/!/g, '%21');
}


export const isJsonString = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}