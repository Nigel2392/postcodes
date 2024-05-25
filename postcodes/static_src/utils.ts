
let latestFetchTimestamp = 0;

function fetchAPI(input: string | URL | Request, init?: RequestInit): Promise<any> {
    const promise = fetch(input, init)

    const timestamp = Date.now();
    latestFetchTimestamp = timestamp;


    var newP = new Promise((resolve, reject) => {
        
        promise.then((response) => {

            if (latestFetchTimestamp !== timestamp) {
                // Do nothing.
                return;
            }
            if (response.ok) {
                resolve(response);
            } else {
                reject(response);
            }
        }).catch(reject);
    });

    return newP;
}


function isZero(value: string | number) {
    return (
           value === ''
        || value === '0'
        || value === 0
        || value == undefined
        || value == null
    )
}

function hasPattern(input: HTMLInputElement, attr: string) {
    return input && input.hasAttribute(attr);
}

const patterns: any = {}

function pattern(input: HTMLInputElement, attr: string) {
    let key = input.getAttribute(attr);
    if (key in patterns) {
        return patterns[key];
    }

    const re = new RegExp(key, 'i');
    patterns[key] = re;
    return re;
}

function hasMin(input: HTMLInputElement) {
    return input && input.hasAttribute('min');
}

function validateMin(input: HTMLInputElement, value: string) {
    let min = input.getAttribute('min');
    if (min) {
        return parseFloat(value) >= parseFloat(min);
    }
    return true;
}

function hasMax(input: HTMLInputElement) {
    return input && input.hasAttribute('max');
}

function validateMax(input: HTMLInputElement, value: string) {
    let max = input.getAttribute('max');
    if (max) {
        return parseFloat(value) <= parseFloat(max);
    }
    return true;
}

function validateInput (input: HTMLInputElement, value: string = null, classes: any = null) {
    if (!classes) {
        classes = {}
    }
    if (hasPattern(input, 'pattern')) {
        if (!pattern(input, 'pattern').test(value || input.value)) {
            input.classList.add(classes.pattern || 'is-invalid-pattern');
            return false
        } else {
            input.classList.remove(classes.pattern || 'is-invalid-pattern');
            return true
        }
    }
    if (hasMin(input)) {
        if (!validateMin(input, value || input.value)) {
            input.classList.add(classes.min || 'is-invalid-min');
            return false
        } else {
            input.classList.remove(classes.min || 'is-invalid-min');
            return true
        }
    }
    if (hasMax(input)) {
        if (!validateMax(input, value || input.value)) {
            input.classList.add(classes.max || 'is-invalid-max');
            return false
        } else {
            input.classList.remove(classes.max || 'is-invalid-max');
            return true
        }
    }
    return true
}

function newURL(url: string) {
    if (!url.startsWith('http')) {
        if (url.startsWith('/')) {
            url = url.slice(1);
        }
        url = `${window.location.origin}/${url}`;
    }
    return new URL(url);
}

export {
    isZero,
    newURL,
    validateInput,
    fetchAPI,
};