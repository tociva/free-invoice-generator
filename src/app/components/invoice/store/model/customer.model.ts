import { Country } from "./country.model";

export interface Customer {
    name: string;
    mobile: string;
    email: string;
    gstin: string;
    line1: string;
    line2: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: Country;
}