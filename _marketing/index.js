var convert = require('xml-js');
var xml = require('fs').readFileSync('WF&FSA.xml', 'utf8');

// var options = {ignoreComment: true, alwaysChildren: true};
// var result = convert.xml2js(xml, options); // or convert.xml2json(xml, options)
// console.log(result);
var parseString = require('xml2js').parseString;

let toTextData = (items, options) => {

    let text = '';

    if (items && items.length) {

        let separator = ',';

        if (options && options.separator) {
            separator = options.separator;
        }

        for (let prop in items[0]) {
            text += prop + separator;
        }

        text += '\r';

        for (let item of items) {
            for (let prop in items[0]) {
                text += item[prop] + separator;
            }
            text += '\r';
        }

    }

    return text;
}

let replaceAll = (text, replaceValue, replaceBy) => {
    if (text) {
        return text.split(replaceValue).join(replaceBy);
    }
    else {
        return text;
    }
}

let removeSpaces = (text) => {
    return text.replace(/\s+/g, " ");
};

parseString(xml, (err, result) => {

    let root = result.div;

    let items = root.div;

    let customers = [];

    for (let item of items) {

        let element = item.div;
        let main = element[0];
        let body = element[1].div;

        let name = replaceAll(main._, ',', '');

        if (body) {

            let fullAddress = body[0].span;
            let phones = body[1].span;
            let contacts = body[2]._.split(':')[1].trim();
            let type = body[3]._.split(':')[1].trim();

            let street = '';
            let state = '';
            let city = '';
            let zip = '';
            let country = '';

            if (fullAddress && fullAddress.length) {

                if (fullAddress[0]) {
                    street = replaceAll(fullAddress[0], ',', '.');
                }

                if (fullAddress[1]) {

                    let geo = fullAddress[1].split(',');

                    if (geo) {

                        city = geo[0] || '';

                        if (geo[1]) {
                            let stateLine = geo[1].split(' ');
                            state = stateLine[1] || '';
                            zip = stateLine[2] || '';
                        }
                    }
                }

                if (fullAddress[2]) {
                    country = fullAddress[2].trim();
                }
            }

            let contactName = '';

            if (contacts) {

                contactName = replaceAll(contacts, '\n', '').trim();

                // let contactItems = contacts.replace('\n', ' ').split(' ');
                //
                // let names = 0;
                //
                // for (let contactItem of contactItems) {
                //
                //     if (contactItem) {
                //         contactItem = contactItem.trim();
                //     }
                //
                //     if (contactItem) {
                //
                //         if (names < 2) {
                //             contactName += ' ' + contactItem;
                //             names++;
                //         }
                //         else {
                //             contactJob += ' ' + contactItem;
                //         }
                //     }
                // }

            }

            let description = '';

            if (body[4] && body[4]._) {
                description = body[4]._.replace('Listing:', '').trim();
                description = replaceAll(description, '\n', ' ');
            }

            let key = `${name}-${type}-${state}-${city}-${zip}`;

            let customer = customers.find(o => o.key === key);

            if (!customer) {

                customer = {
                    key: key,
                    name: name,
                    type: type,
                    street: street,
                    city: city,
                    state: state,
                    zip: zip,
                    country: country
                };

                customers.push(customer);
            }

            for (let phone of phones) {

                if (phone && phone._) {

                    let keyValue = phone._.split(':');
                    let key = keyValue[0].trim();
                    let value = keyValue[1].trim().replace(' ', '_');

                    if (key) {

                        if (key === 'Web') {
                            if (phone.a && phone.a[0] && phone.a[0]._) {
                                customer[key] = phone.a[0]._.trim();
                            }
                        }
                        else {
                            customer[key] = value ||  '';
                        }
                    }
                }
            }

            customer.description = description;
            customer.contactName = contactName;

        }

    }

    // let text = toTextData(customers, {separator: '|'});
    let text = toTextData(customers);

    console.log(customers);

});

