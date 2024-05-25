import {
    Address,
    LookupOptions,
    BindOptions,
    lookupPostcode,
} from "./postcodes";


declare global {
    interface Window {
        lookupPostcode: (options: LookupOptions) => Promise<Address> | undefined;
    }
}


export {
    Address,
    LookupOptions,
    BindOptions,
    lookupPostcode,
}

window.lookupPostcode = lookupPostcode;