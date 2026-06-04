/*global Ultraviolet*/
self.__uv$config = {
    prefix: '/uv-test/service/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv-test/uv.handler.js',
    client: '/uv-test/uv.client.js',
    bundle: '/uv-test/uv.bundle.js',
    config: '/uv-test/uv.config.js',
    sw: '/uv-test/uv.sw.js',
};
