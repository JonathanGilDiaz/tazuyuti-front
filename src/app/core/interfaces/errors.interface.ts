/**
 * Interface para el manejo de errores de las subscripciones.
 */
export interface GlobalError {
    headers:    GlobalErrorHeaders;
    status:     number;
    statusText: string;
    url:        string;
    ok:         boolean;
    name:       string;
    message:    string;
    error:      Error;
}

export interface Error {
    success: boolean;
    message: string;
    data:    any;
}

export interface GlobalErrorHeaders {
    normalizedNames: NormalizedNamesClass;
    lazyUpdate:      null;
    headers:         NormalizedNamesClass;
}

export interface NormalizedNamesClass {
}
