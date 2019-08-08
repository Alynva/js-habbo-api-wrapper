class Entity {
    constructor(data) {
        if (data) {
            this.parse(data)
        }
    }

    parse(data) {
        this._data = data;
    }
}

class Habbo extends Entity {
    parse(data) {
        this.id = data.uniqueId
        this.name = data.name
        this.motto = data.motto
        this.figureString = data.figureString || data.habboFigure
        this.memberSince = data.memberSince
        this.profileVisible = data.profileVisible
        this.selectedBadges = data.selectedBadges ? data.selectedBadges.map(b => new Badge(b)) : data.selectedBadges
    }
}

class Profile extends Entity {
    parse(data) {
        this.habbo = new Habbo(data.user)
        this.friends = data.friends ? data.friends.map(f => new Habbo(f)) : data.friends
        this.groups = data.groups ? data.groups.map(g => new Group(g)) : data.groups
        this.rooms = data.rooms ? data.rooms.map(r => new Room(r)) : data.rooms
        this.badges = data.badges ? data.badges.map(b => new Badge(b)) : data.badges
    }
}

class Photo extends Entity {
    parse(data) {
        this.id = data.id
        this.preview_url = data.previewUrl
        this.tags = data.tags
        this.type = data.type
        this.url = data.url
        this.taken_on = data.time
        this.creator_uniqueId = data.creator_uniqueId
        this.creator_name = data.creator_name
        this.creator_id = data.creator_id
        this.room_id = data.room_id
        this.likes = data.likes
    }
}

class Group extends Entity {
    parse(data) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.type = data.type
        this.primaryColour = data.primaryColour
        this.secondaryColour = data.secondaryColour
        this.badgeCode = data.badgeCode
        this.roomId = data.roomId
        this.isAdmin = data.isAdmin
        this.members = []
    }

    addMember(member) {
        this.members.push(member)
    }
}

class Achievement extends Entity {
    parse(data) {
        // this._data = data
        this.id = data.achievement.id
        this.name = data.achievement.name
        this.category = data.achievement.category
        this.requirements = data.requirements
        this.level = data.level
        this.score = data.score
    }
}

class Room extends Entity {
    parse(data) {
        // this._data = data
        this.id = data.id
        this.uniqueId = data.uniqueId
        this.name = data.name
        this.description = data.description
        this.creationTime = data.creationTime
        this.habboGroupId = data.habboGroupId
        this.maximumVisitors = data.maximumVisitors
        this.tags = data.tags
        this.showOwnerName = data.showOwnerName
        this.ownerName = data.ownerName
        this.ownerUniqueId = data.ownerUniqueId
        this.categories = data.categories
        this.thumbnailUrl = data.thumbnailUrl
        this.imageUrl = data.imageUrl
        this.rating = data.rating
    }
}

class Badge extends Entity {
    parse(data) {
        // this._data = data
        this.badgeIndex = data.badgeIndex
        this.code = data.code
        this.name = data.name
        this.description = data.description
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
                habbo.parse(r);
            }).catch((err) => {
                throw new Error("Error getting habbo's info: ", +err);
            });

        return habbo;
    }

    async getProfile(id) {
        let url = '/api/public/users/'+id+'/profile';

        let profile = new Profile();

        await this._urlRquest(this.api_base + url)
            .then((r) => {
                profile.parse(r);
            }).catch((err) => {
                throw new Error("Error getting profile: ", +err);
            });

        return profile;
    }

    async getPhotos(id) {
        let url = id ? '/extradata/public/users/'+id+'/photos' : '/extradata/public/photos';

        let photos = [];

        await this._urlRquest(this.api_base + url)
            .then((r) => {
                r.map(p => photos.push(new Photo(p)));
            }).catch((err) => {
                throw new Error("Error getting photos: ", +err);
            });

        return photos;
    }

    async getGroup(id) {
        let url_group = '/api/public/groups/'+id,
            url_members = url_group+'/members';

        let group = new Group();

        await this._urlRquest(this.api_base + url_group)
            .then((r) => {
                group.parse(r);
            }).catch((err) => {
                throw new Error("Error getting group's info: " + err)
            });

        await this._urlRquest(this.api_base + url_members)
            .then((r) => {
                r.map(m => group.addMember(new Habbo(m)));
            }).catch((err) => {
                throw new Error("Error getting group's members: " + err)
            });

        return group;
    }

    async getAchievements(id) {
        let url = '/api/public/achievements/'+id;

        let achs = [];

        await this._urlRquest(this.api_base + url)
            .then((r) => {
                r.map(a => achs.push(new Achievement(a)))
            }).catch((err) => {
                throw new Error("Error getting achievements: ", +err);
            });

        return achs;
    }

    _urlRquest(url, asJson = true) {
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
                    reject(req.status);
                } else {
                    resolve(asJson ? JSON.parse(req.responseText) : req.responseText);
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