export const encodeURIfix = (str: any) => {
    return encodeURIComponent(str).replace(/!/g, '%21');
}