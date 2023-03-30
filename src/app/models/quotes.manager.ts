export interface QuotesManagerModel {
    companyId: number
    quotes: Quotes[]
}

export interface Quotes {
    id?: number,
    rol?: string
    quote?: number
}
