# js-habbo-api-wrapper
A JavaScript wrapper for the _undocumented_ Habbo API (inspired by https://github.com/gerbenjacobs/HabboAPI)

See `tests/index.html` file to examples of this library.

## How to use it

1. Download the `src/HabboAPI.js`
1. Import it in your sketch
1. Instantiate the `HabboAPI` class with your hotel (tested with `com` and `com.br`)
1. Call one of the following methods:
    - `getHabbo(id, useUniqueId = false)`
    - `getProfile(id)`
    - `getPhotos(id)`
    - `getGroup(id)`
    - `getAchievements(id)`

All of these use [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), in other words, are async and you need to attach an `then(func)` to the calls and this `func` will receive the data as parameter.

## Usage

``` js
let api = new HabboAPI("com.br");
api.getHabbo("alynva")
    .then(user => {
        // Use `user` object here
        
        api.getProfile(user.id)
            .then(profile => {
                // Use `profile` object here
                
                api.getGroup(profile.groups[0].id)
                    .then(group => {
                        // Use `group` objecthere
                    });
            });
        
        // etc...
    });
```

## Objects

An objects list will be available in the repo's wiki.