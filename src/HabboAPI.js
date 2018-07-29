class Habbo {
    parse(data) {
        this.id = data['uniqueId'];
        this.name = data['name'];
        this.motto = data['motto'];
        if (data['figureString']) {
            this.figureString = data['figureString'];
        } else if (data['habboFigure']) {
            this.figureString = data['habboFigure'];
        }

        if (data['memberSince']) {
            this.memberSince = data['memberSince'];
        }

        if (data['profileVisible']) {
            this.profileVisible = data['profileVisible'];
        }

        if (data['selectedBadges']) {
            this.selectedBadges = data['selectedBadges'];
        }
    }

    getMotto() {
        return this.motto;
    }
}

class HabboAPI {
    constructor(hotel = 'com') {
        this.hotel = hotel;
        this.api_base = 'https://www.habbo.'+this.hotel;
    }

    async getHabbo(id, useUniqueId = false) {
        let url = useUniqueId ? '/api/public/users/'+id : '/api/public/users?name='+id;

        let habbo = new Habbo();

        await this._urlRquest(this.api_base + url)
            .then((r) => {
                habbo.parse(r)
            });

        return habbo;
    }

    _urlRquest(url, asJson = false) {
        return new Promise((resolve, reject) => {
            let req;
            if (window.XDomainRequest) {
                req = new XDomainRequest();
                req.open('get', url);
    
                // Update the timeout to 30 seconds for XDomainRequests. 
                req.timeout = 30000;
            } else {
                req = new XMLHttpRequest();
                req.open('get', url);
                // req.setRequestHeader('User-Agent', 'swapi-javascript');
                // req.setRequestHeader('Accept', 'application/json');
            }
            req.onload = e => {
                if(req.readyState != 4 && e.type !== 'load') return;
                if(req.status && req.status != 200) {
                    reject();
                } else {
                    resolve(asJson ? req.responseText : JSON.parse(req.responseText));
                }
            };
    
            // Wrap in a 0 millisecond timeout.
            // XDomainRequests appear to randomly fail unless kicked into a new scope.
            setTimeout(function(){
                req.send();
            }, 0);
        })
    }
}