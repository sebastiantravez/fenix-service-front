import { PersonModel } from "./person.model"

export interface BusinessManagerModel {
    companyId?: number
    person?: PersonModel
    email?: string
}

