let getData = function(url) {
    return new Promise(function(resolve, reject) {
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'json';
        request.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(request.response);
            } 
            else {
                reject({
                    status: this.status,
                    statusText: request.statusText
                });
            }
        };
        request.onerror = function() {
          reject({
            status: this.status,
            statusText: request.statusText
          });
        };
        request.send();
    });
}

export default getData