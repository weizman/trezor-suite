# @trezor/connect-plugins-\*

[@trezor/connect](../connect/) typically does not bundle heavy-weight altcoin SDKs, especially those
that are only used by 3rd-party @trezor/connect implementation meaning they are used nowhere in trezor-suite
ecosystem.

A typical altcoin wallet developer has such SDK already listed as a dependency of his project.
@trezor/connect-plugins contains a collection of methods that depend on 3rd-party SDKs -
see peerDependendencies sections in package.json files. These methods are typically used to transform
data coming from an altcoin SDK into the shape expected by @trezor/connect and vice versa.

| plugin                                         | description                                           |
| ---------------------------------------------- | ----------------------------------------------------- |
| [@trezor/connect-plugins-ethereum](./ethereum) | create message_hash from an EIP-712 Typed Data object |
| [@trezor/connect-plugins-stellar](./stellar)   | stellar-sdk to trezor-connect                         |
