import { Country } from "./country.model";

export interface countryState{
    countries : Country[];
    isLoading : boolean;
    error : string | null;
}
export const initialCountryState : countryState = {
    countries : [],
    isLoading: false,
    error: null,
}