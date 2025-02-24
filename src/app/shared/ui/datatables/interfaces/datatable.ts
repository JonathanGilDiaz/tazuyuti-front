export interface DataTableParams {
    page?: number;
    size?: number;
    sort_field?: string;
    sort_direction?: string;
    search_field? :string;
    search?: string;
    filters?:Record<string, any>;
    sort?: Array<Record<string, string>>; 
}

export interface TipoEvento {
    cmd: string;
    data: any;
}