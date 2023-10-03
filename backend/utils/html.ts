var Readable = require('stream').Readable; 
export const jsonToHtml = (jsonObj: any) => {
    if (!jsonObj || jsonObj.length == 0) return;
    const tag = jsonObj?.tag;
  
    const children = jsonObj?.children || [];
  
    const childrenStr = children
      .map((child: any) => (typeof child === "string" ? child : jsonToHtml(child)))
      .join("");
  
    const attributes = jsonObj?.attributes;
  
    let attrsStr;
    if (attributes) {
      attrsStr = Object?.entries(attributes)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
    }
  
    if (tag === "HEAD") {
      return `<${tag.toLowerCase()} ${attrsStr}>${childrenStr}</${tag.toLowerCase()}>`;
    } else if (tag === "BODY") {
      return childrenStr;
    } else {
      return `<${tag?.toLowerCase()} ${attrsStr}>${childrenStr}</${tag?.toLowerCase()}>`;
    }
};


export const bufferToStream = (buffer: any) => { 
    var stream = new Readable();
    stream.push(buffer);
    stream.push(null);
  
    return stream;
}