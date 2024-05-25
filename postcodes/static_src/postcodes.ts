import { fetchAPI, isZero, newURL, validateInput } from './utils';

interface Address {
    postcode: string;
    home_number: string;
    // Optional fields
};


type BindOptions = {
    postcode: HTMLInputElement;
    home_number: HTMLInputElement;
    // Optional fields
};


interface LookupOptions {
    postcode?: string;
    home_number?: string;
    bind?: BindOptions
    success?: (address: Address) => void;
    error?: (error: Error) => void;
    buildRequest?: (postcode: string, home_number: string) => {input: string | URL | Request, init?: RequestInit};
};


const inputClasses = {
    empty: 'is-empty',
    invalid: 'is-invalid',
    pattern: 'is-invalid-pattern',
    min: 'is-invalid-min',
    max: 'is-invalid-max',
}

const inputClassValues = Object.values(inputClasses);


/**
 * Lookup address data for a given postcode and home number
 * This function will throw an error if the postcode lookup fails
 * @param options The options for the postcode lookup
 * @returns The address data for the given postcode and home number
 * @throws Error if the postcode lookup fails
 */
async function lookupPostcode(options: LookupOptions): Promise<Address> | undefined {

    let postcode = options.postcode;
    let home_number = options.home_number;

    if (options && options.bind && options.bind.postcode && options.bind.home_number) {
        const postcodeInput = options.bind.postcode;
        const home_numberInput = options.bind.home_number;

        delete options.bind.postcode;
        delete options.bind.home_number;

        const keys = Object.keys(options.bind) as (keyof BindOptions)[];
        if (keys.length == 0) {
            throw new Error('At least postcode, home_number and one other field must be bound');
        }

        const bound: any = options.bind;

        const clearEmptyInputs = () => {
            if (!postcode && !home_number) {
                for (let i = 0; i < inputClassValues.length; i++) {
                    const cls = inputClassValues[i];
                    postcodeInput.classList.remove(cls);
                    home_numberInput.classList.remove(cls);
                }
    
                for (const key of keys) {
                    const input = bound[key];
                    if (input) { input.value = '' }
                }
                return true
            }
            return false
        }
        
        const success = (addr: Address) => {
            postcodeInput.classList.remove(inputClasses.invalid);
            home_numberInput.classList.remove(inputClasses.invalid);

            for (const key of keys) {
                const input = bound[key];
                if (input) {
                    const value = addr[key];

                    for (const cls of inputClassValues) {
                        input.classList.remove(cls);
                    }

                    if (!isZero(value) && (postcode || home_number)) {
                        input.classList.remove(inputClasses.empty);
                        input.value = value.toString();
                    } else {
                        input.classList.add(inputClasses.empty);
                    }          
                }
            }
        };


        const fail = (error: Error) => {
            if (options && options.error) {
                options.error(error);
            }
            postcodeInput.classList.add(inputClasses.invalid);
            home_numberInput.classList.add(inputClasses.invalid);
        }

        const listener = (input: HTMLInputElement) => {
            input.classList.add("postcodes-input");
            
            return () => {
                postcode = postcodeInput.value;
                home_number = home_numberInput.value;
                if (clearEmptyInputs()) { return };
                if (!validateInput(input, null, inputClasses)) { return };
                _lookupPostcode(postcode, home_number, options).then(success).catch(fail);
            }
        }

        const listen = () => {

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const input = bound[key];
                if (input) {
                    input.classList.add("postcodes-input");
                    input.addEventListener('change', () => validateInput(input, null, inputClasses));
                }
            }

            postcodeInput.addEventListener('input', listener(postcodeInput));
            home_numberInput.addEventListener('input', listener(home_numberInput));
        };

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            listen();
        } else {
            document.addEventListener('DOMContentLoaded', listen);
        }

        return undefined;
    }

    if (options && options.bind && (!options.bind.postcode || !options.bind.home_number)) {
        throw new Error('Both postcode and home_number must be bound to use the bind option');
    }

    try {
        return await _lookupPostcode(postcode, home_number, options);
    } catch (error) {
        if (options && options.error) {
            options.error(error);
        }
        throw error;
    }
}


async function _lookupPostcode(postcode: string, home_number: string, options: LookupOptions): Promise<Address> {

    postcode = postcode?.trim();
    home_number = home_number?.trim();

    if (!postcode) {
        throw new Error('No postcode provided');
    }

    if (!home_number) {
        throw new Error('No home number provided');
    }

    let buildRequest = options.buildRequest || function (postcode: string, home_number: string) {
        let url = newURL(postcode_API_URL);
        url.searchParams.append('postcode', postcode);
        url.searchParams.append('home_number', home_number.toString());

        return {
            input: url,
            init: {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        }
    };

    const { input, init } = buildRequest(postcode, home_number);
    const response = await fetchAPI(input, init);

    let data: any;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error('Failed to parse response from postcode lookup service');
    }

    if (!("success" in data)) {
        throw new Error('Invalid response from postcode lookup service, missing "success" field');
    }

    if (!data.success) {
        if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Failed to fetch postcode data');
        }
    }

    if (!("data" in data)) {
        throw new Error('Invalid response from postcode lookup service, missing "data" field');
    }

    const addr = data.data as Address;
    if (options.success) {
        options.success(addr);
    }
    return addr;
};


const postcode_API_URL = (document as any).currentScript.dataset.apiUrl;

if (!postcode_API_URL) {
    throw new Error('No API URL provided, cannot initialize postcode lookup module');
} else {
    console.log('Postcode lookup module initialized with API URL:', postcode_API_URL);
}

export {
    lookupPostcode,
    Address,
    BindOptions,
    LookupOptions,
};


