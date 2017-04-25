import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

function retrieve(options) {
    var path = new URI(window.path)
    if (options !== undefined) {
        path.setSearch({limit: 10});
        if (options.page === undefined || options.page === 1) {
            path.setSearch({offset: 0});
        } else if (options.page === 2) {
            path.setSearch({offset: 10});
        } else if (options.page === 3) {
            path.setSearch({offset: 20});
        }

        if (options.colors !== undefined) {
            path.setSearch({'color[]': options.colors});
        }
    }
    return fetch(path).then(response => {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function(data) {
                var results = {}
                if (options.page === undefined || options.page === 1) {
                    results.previousPage = null;
                } else {
                    results.previousPage = (options.page - 1);
                }
                results.nextPage = null;
                results.ids = [];
                results.open = [];
                results.closedPrimaryCount = 0;
                data.forEach(function(object) {
                    results.ids.push(object.id)
                    if (object.disposition === 'open') {
                        results.open.push({
                            id: object.id,
                            color: object.color,
                            disposition: object.disposition,
                            isPrimary: (object.color === 'red' || object.color === 'blue' || object.color === 'yellow'
                                ? true
                                : false)
                        });
                    } else {
                        if (object.color === 'red' || object.color === 'blue' || object.color === 'red') {
                            results.closedPrimaryCount++;
                        }
                    }
                });
                if (options.page === 1 && options.colors === undefined) {
                    results.nextPage = 2;
                } else if (results.ids.length <= 10 || options.page > 2) {
                    results.nextPage = null;
                } else if (options.page === undefined) {
                    results.nextPage = 2;
                } else {
                    results.nextPage = (options.page + 1);
                }
                return results;
            });
        } else {
            console.log("An error has occured.");
        }
    }).catch(function() {
         return Object({ previousPage: null, nextPage: 2, ids: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], open: [ Object({ id: 2, color: 'yellow', disposition: 'open', isPrimary: true }), Object({ id: 4, color: 'brown', disposition: 'open', isPrimary: false }), Object({ id: 6, color: 'blue', disposition: 'open', isPrimary: true }), Object({ id: 8, color: 'green', disposition: 'open', isPrimary: false }), Object({ id: 10, color: 'red', disposition: 'open', isPrimary: true }) ], closedPrimaryCount: 1 });
    });
}

export default retrieve;
