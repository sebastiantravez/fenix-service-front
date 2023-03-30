export interface LegalRepresentativeModel {
    email?: string,
    person: Person
}


export interface Person {
    id?: number,
    name?: string,
    lastName?: string,
    document: string
}