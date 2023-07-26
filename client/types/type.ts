export interface BlogLink {
    label: string;
    value: string;
    selected: boolean;
    id: string;
    index: number;
    type: 'file' | 'url';
}