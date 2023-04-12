export const htmlToJson = (htmlString) => {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlString, "text/html");
  function nodeToJson(node) {
    const json = {
      tag: node.tagName,
      attributes: {},
      children: [],
    };
    for (let i = 0; i < node.attributes.length; i++) {
      const attribute = node.attributes[i];
      json.attributes[attribute.name] = attribute.value;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      if (childNode.nodeType === 1) {
        json.children.push(nodeToJson(childNode));
      } else if (childNode.nodeType === 3) {
        const text = childNode.nodeValue;
        if (text.trim().length > 0) {
          json.children.push(text);
        }
      }
    }
    return json;
  }

  return nodeToJson(htmlDoc.body);
};

export const jsonToHtml = (jsonObj) => {
  if (!jsonObj || jsonObj.length == 0) return;
  console.log("===", jsonObj);
  const tag = jsonObj?.tag;

  const children = jsonObj?.children || [];

  const childrenStr = children
    .map((child) => (typeof child === "string" ? child : jsonToHtml(child)))
    .join("");

  const attributes = jsonObj?.attributes;

  let attrsStr;
  if (attributes) {
    attrsStr = Object?.entries(attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  }

  if (tag === "HEAD") {
    return `<${tag} ${attrsStr}>${childrenStr}</${tag}>`;
  } else if (tag === "BODY") {
    return childrenStr;
  } else {
    return `<${tag} ${attrsStr}>${childrenStr}</${tag}>`;
  }
};

export function logout(item) {
  if (item.name === "Logout") {
    localStorage.clear();
    window.location.href = "/";
  }
}

