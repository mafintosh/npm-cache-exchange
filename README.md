# npm-cache-exchange

Exchange npm caches with someone else on the local network

```
npm install -g npm-cache-exchange
```

## Usage

On one computer run

``` sh
computer-1> npm-cache-exchange
```

And on another one run the same


``` sh
computer-2> npm-cache-exchange
```

These two computers will now exchange
their npm cache.

You can force npm to only use the cache by setting the `--cache-min 999999999` argument.
which allows you to use npm offline

``` sh
npm --cache-min 99999999 install a-module # works offline
```

## License

MIT
