export interface GenerateBlogMutationArg {
    keyword: String;
    user_id: string;
}

export interface ReGenerateBlogMutationArg {
    ideas: [Ideas];
    blog_id: string;
}

export interface UpdateBlogMutationArg {
    tinymce_json: String;
    blog_id: string;
    platform: String;
}

export interface Ideas {
    text: String;
    article_id: String;
}

export interface ReGenerateBlogMutationArg {
    ideas: [Ideas];
    blog_id: string
}

export interface User {
    id: string;
    email: string;
    company: string;
    iat: number;
    exp: number;
}

export interface FetchBlog {
    id: string
}

export interface IRNotifiyArgs {
    user_id: string;
    topic: String;
    sequence_ids: string[]
}

export interface BlogListArgs {
    page_limit: number;
    page_skip: number;
    status: string;
}