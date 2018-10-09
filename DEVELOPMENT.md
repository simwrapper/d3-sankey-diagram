# Testing

Testing public exports can be done using the bundle, as the example d3-plugin
does, but this does not let you test internal functions.

[reify](https://github.com/benjamn/reify) lets you use ES6 modules in nodejs.

Run the tests using `npm test`.

# Releasing a new version

Bump the version with `npm version`
