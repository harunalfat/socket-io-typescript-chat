import { Base } from "./base";

export interface Channel extends Base {
    name: string
    creatorId: string
    isPrivate: boolean
    hashIdentifier: string
}