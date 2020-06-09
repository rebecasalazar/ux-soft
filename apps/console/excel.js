const xlsx = require('xlsx');

class Service {

    constructor() {
        // super();
        this.callback = null;
        this.subscriptionCode = null;
        this.storageOptions = null;
    }

    init(options) {

    }

    getData(request) {

        let self = this;

        return new Promise((resolve, reject) => {

            let method = request.method;
            let worker = request.worker;

            let res = [];
            let transTypes = self.filterTransactionTypes(method);

            if (transTypes.length) {

                transTypes.forEach((transType) => {

                    if (!worker) {
                        resolve({message: 'Process Start With Queue'});
                    }

                    let api = self.connect(transType);

                    let fileName = this.subscriptionCode;

                    if (request.appSubscriptionId) {
                        fileName += request.appSubscriptionId;
                    }

                    api.downloadFile({
                        storage: 'traze.integration.excel',
                        key: fileName + '.xls'
                    }).then((data) => {

                        let objects = self.excelToJson({
                            data: data.Body,
                            worksheet: request.worksheet,
                            columnsException: request.columnsException,
                            laterColumnExport: request.laterColumnExport
                        });

                        let finish = (objects) => {
                            for (let i = 0; i < objects.length; i++) {

                                let object = objects[i];
                                let description = object.AccountName || object.CompanyName
                                    || (object.FirstName + ' ' + object.LastName) || object.Name;

                                let reference = 'foreign Id ' + object.AccountCode || object.Reference || '';

                                res.push(
                                    super.createTransaction({
                                        transType: transType,
                                        status: 'processing',
                                        direction: transType.type.direction,
                                        reference: reference,
                                        description: description,
                                        rawData: [object]
                                    })
                                );
                            }

                            if (self.callback) {
                                self.callback(res);
                            }

                            resolve(res);
                        };

                        if (request.preVerify) {
                            super[request.preVerify]({
                                appSubscriptionId: request.appSubscriptionId, products:objects,
                                transType: transType
                            }).then(() => {
                                finish(objects)
                            }).catch((err) => {
                                reject(err);
                            });
                        }
                        else {
                            finish(objects)
                        }
                    }).catch((err) => {
                        resolve(err);
                    });
                });
            }
            else {
                resolve({message: "It Don't Have Transaction Type"});
            }
        });
    }

    excelToJson(options) {

        let arr = [];

        for (let i = 0; i !== options.data.length; ++i) {
            arr[i] = String.fromCharCode(options.data[i]);
        }

        let bstr = arr.join("");
        let workbook = xlsx.read(bstr, {type: "binary"});
        let worksheet = workbook.Sheets[options.worksheet];

        let columnsException = [];
        let sheetHeader = [];
        let columnsProperties = [];

        let later = null;
        let end = null;
        let rowHeader = 1;
        let currentData = 2;
        let colProperty = null;

        let colException;

        if (options.columnsException && options.columnsException.length) {
            columnsException = options.columnsException;
        }

        for (let z in worksheet) {

            /* all keys that do not begin with "!" correspond to cell addresses */
            if (z[0] === '!') continue;

            let cel = z.split('');

            for (let i = 0; i < cel.length; i++) {
                if (Number.isInteger(Math.floor(cel[i]))) {
                    end = i;
                    break;
                }
            }

            later = z.substring(0, end);
            colException = columnsException.find(o => o === later);

            if (!colException) {

                if (typeof worksheet[z].v === 'number') {
                    colProperty = {col: later, propertyName: worksheet[z].v};
                }
                else {
                    colProperty = {col: later, propertyName: worksheet[z].v.trim()};
                }

                later = later + rowHeader;

                if (later === z) {
                    sheetHeader.push(z);
                    columnsProperties.push(colProperty);
                } else {
                    break;
                }
            }
        }

        let objects = [];
        let object = {};
        let count = 0;

        let totalCells = Object.keys(worksheet).length;

        let header;
        let _export;

        for (let z in worksheet) {

            count += 1;

            if (count === totalCells) {
                if (_export) {
                    objects.push(JSON.parse(JSON.stringify(object)));
                }
            }

            /* all keys that do not begin with "!" correspond to cell addresses */
            if (z[0] === '!') continue;

            let cel = z.split('');
            for (let i = 0; i < cel.length; i++) {
                if (Number.isInteger(Math.floor(cel[i]))) {
                    end = i;
                    break;
                }
            }

            later = z.substring(0, end);
            let row = parseInt(z.substring(end));

            if (!options.laterColumnExport) {
                _export = 1;
            }
            else if (later === options.laterColumnExport) {
                _export = worksheet[z].v;
            }

            header = sheetHeader.find(o => o === z);
            colException = columnsException.find(o => o === later);

            if (!header && !colException) {

                colProperty = columnsProperties.find(o => o.col === later);

                if (row !== currentData) {
                    if (object) {
                        if (_export) {
                            objects.push(object);
                        }
                    }

                    object = {};
                    currentData = row;
                }

                if (typeof worksheet[z].v === 'number') {
                    if (worksheet[z].w && isNaN(worksheet[z].w)) {
                        object[colProperty.propertyName] = worksheet[z].w.trim();
                    }
                    else {
                        object[colProperty.propertyName] = worksheet[z].v;
                    }
                }
                else {
                    object[colProperty.propertyName] = worksheet[z].v.trim();
                }
            }
        }

        return objects;
    }
}

module.exports = Service;

