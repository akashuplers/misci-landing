import { BlogLink } from "@/pages";

export function maxFileSize(MB: number) {
    return MB * 1024 * 1024;
}


export const allowedFormats = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/rtf"];
export const allowedFormatsString = allowedFormats.join(", ");
export const createBlogLink = (
    name: string,
    type: 'file' | 'url' = 'url',
    index: number
  ): BlogLink => {
    // Ensure that the 'type' parameter can only be 'file' or 'url'
    if (type !== 'file' && type !== 'url') {
      throw new Error("Invalid 'type' parameter. It should be either 'file' or 'url'.");
    }
  
    const blogLink: BlogLink = {
      id :name,
      label: name,
      type,
      index,
      selected: false,
      value: name, // For 'file' type, set an empty value; for 'url' type, set the name as the value
    };
  
    return blogLink;
  };
  