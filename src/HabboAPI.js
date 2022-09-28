class Entity {
    constructor(data) {
        if (data) {
            this.parse(data)
        }
    }

    parse(data) {
        this._data = data
        throw new Error('The method "parse" was not implemented. The data is accessible from "this._data".')
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
        this.hotel = hotel
        this.api_base = 'https://www.habbo'+(hotel==='game'?'x':'')+'.'+this.hotel
    }

    async getHabbo(id, useUniqueId = false) {
        const url = useUniqueId ? '/api/public/users/'+id : '/api/public/users?name='+id

        const habbo = new Habbo()

        await this.fetchAPI(this.api_base + url)
            .then(r => habbo.parse(r))
            .catch((err) => {
                throw new Error(`Error getting habbo's info: ${err}`)
            })

        return habbo
    }

    async getProfile(id) {
        const url = '/api/public/users/'+id+'/profile'

        const profile = new Profile()

        await this.fetchAPI(this.api_base + url)
            .then(r => profile.parse(r))
            .catch((err) => {
                throw new Error(`Error getting profile: ${err}`)
            })

        return profile
    }

    async getPhotos(id) {
        const url = id ? '/extradata/public/users/'+id+'/photos' : '/extradata/public/photos'

        const photos = []

        await this.fetchAPI(this.api_base + url)
            .then(r => r.forEach(p => photos.push(new Photo(p))))
            .catch((err) => {
                throw new Error(`Error getting photos: ${err}`)
            })

        return photos
    }

    async getGroup(id) {
        const url_group = '/api/public/groups/'+id,
            url_members = url_group+'/members'

        const group = new Group()

        await this.fetchAPI(this.api_base + url_group)
            .then(r => group.parse(r))
            .catch((err) => {
                throw new Error(`Error getting group's info: ${err}`)
            })

        await this.fetchAPI(this.api_base + url_members)
            .then(r => r.forEach(m => group.addMember(new Habbo(m))))
            .catch((err) => {
                throw new Error(`Error getting group's members: ${err}`)
            })

        return group
    }

    async getAchievements(id) {
        const url = '/api/public/achievements/'+id

        const achievements = []

        await this.fetchAPI(this.api_base + url)
            .then(r => r.forEach(a => achievements.push(new Achievement(a))))
            .catch((err) => {
                throw new Error(`Error getting achievements: ${err}`)
            })

        return achievements
    }

    fetchAPI(url) {
        return fetch(url)
            .then(async r => {
                if (!r.ok) throw (await r.json())
                return r
            })
            .then(r => r.json())
            .catch(err => {
                let message
                if (err.errors) {
                    switch (err.errors[0].msg) {
                        case "user.invalid_name":
                            message = `${err.errors[0].value} is an invalid Habbo name.`
                            break
                    
                        default:
                            message = `Unknown error from Habbo API: ${JSON.stringify(err.errors)}`
                            break
                    }
                } else if (err.error) {
                    switch (err.error) {
                        case "not-found":
                            message = `The user was not found.`
                            break
                    
                        default:
                            message = `Unknown error from Habbo API: ${JSON.stringify(err.error)}`
                            break
                    }
                } else {
                    message = `Unknown error from Habbo API: ${JSON.stringify(err)}`
                }
                throw new Error(message)
            })
    }
}