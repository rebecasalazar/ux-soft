const Salesforce    = require('node-salesforce');

class Salesforce {

    constructor() {

        this.version = '41.0';
        this.loginUrl = 'https://na173.lightning.force.com/';
        this.username = 'paulo.sala@trazesoft.com';
        this.password = '$Ala1977';
        this.securityToken = 'hbjfaBPivHwnujyJu3V2Rd8D';
    }

    connect() {
        return new Salesforce.Connection({
            loginUrl: options.loginUrl,
            version: '41.0'
        });
    }

    getQuery(request) {

        let self = this;

        return new Promise((resolve, reject) => {

            let api = request.api || self.connect(request.transType);

            api.login(self.username, self.password + self.securityToken, (err) => {

                if (err) {
                    return reject(err);
                }

                if (request.query) {

                    api.query(request.query, (err, records) => {

                        if (err) {
                            return reject(err);
                        }

                        resolve(records);
                    });
                }
                else {

                    if (request.include) {

                        api.sobject(request.entity).find(
                            request.find).select('*').include(request.include).execute((err, records) => {

                            if (err) {
                                return reject(err);
                            }

                            resolve(records);
                        });

                    }
                    else {

                        api.sobject(request.entity).find(request.find).execute((err, records) => {
                            if (err) {
                                return reject(err);
                            }

                            resolve(records);
                        });
                    }
                }
            });
        });
    }

    getAccounts() {

        this.getQuery({
            query: 'SELECT Id, Name, LastModifiedDate FROM Account'
        }).then((data) => {
    
            if (data && data.records.length) {
    
                resolve({message: 'Process Start With Queue'});
    
            }
            else {
    
                resolve({message: "It Don't Have Data To Update"});

            }
        }).catch((err) => {
            reject(err);
        });
    }

}

module.exports = Service;


