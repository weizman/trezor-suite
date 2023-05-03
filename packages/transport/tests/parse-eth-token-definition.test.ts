import { messageToJSON } from '../src/lowlevel/protobuf/decode';
import { parseConfigure } from '../src/lowlevel/protobuf/messages';

import messages from '../messages.json';

const UsdcEthTokenDefinition = Uint8Array.from([
    116, 114, 122, 100, 49, 1, 56, 216, 42, 100, 42, 0, 10, 20, 160, 184, 105, 145, 198, 33, 139,
    54, 193, 209, 157, 74, 46, 158, 176, 206, 54, 6, 235, 72, 16, 1, 26, 4, 85, 83, 68, 67, 32, 6,
    42, 8, 85, 83, 68, 32, 67, 111, 105, 110, 13, 241, 148, 151, 28, 145, 66, 187, 220, 162, 102,
    119, 227, 66, 175, 189, 250, 244, 190, 23, 247, 254, 229, 88, 16, 121, 111, 102, 42, 118, 55,
    160, 204, 17, 80, 55, 214, 186, 234, 44, 58, 233, 152, 66, 82, 161, 93, 37, 101, 243, 27, 238,
    118, 80, 225, 211, 73, 98, 194, 43, 122, 30, 142, 185, 39, 177, 187, 255, 55, 20, 240, 145, 63,
    149, 90, 37, 167, 211, 48, 40, 217, 70, 166, 86, 124, 91, 145, 99, 175, 158, 143, 2, 230, 151,
    69, 110, 92, 60, 227, 15, 115, 177, 39, 62, 38, 253, 120, 32, 151, 54, 110, 154, 165, 215, 156,
    233, 14, 21, 91, 155, 101, 220, 187, 252, 102, 148, 43, 116, 13, 203, 34, 54, 198, 58, 180, 234,
    182, 226, 90, 13, 13, 73, 224, 114, 223, 237, 97, 105, 89, 27, 241, 28, 81, 187, 242, 70, 174,
    23, 4, 127, 84, 182, 47, 217, 165, 216, 178, 252, 47, 221, 95, 161, 218, 18, 65, 101, 70, 43,
    58, 250, 188, 212, 250, 98, 0, 237, 230, 85, 190, 12, 227, 215, 139, 249, 35, 142, 40, 33, 232,
    32, 212, 154, 172, 206, 95, 122, 131, 87, 239, 11, 243, 115, 63, 212, 58, 162, 6, 190, 95, 53,
    109, 135, 75, 115, 55, 243, 109, 215, 72, 197, 62, 207, 12, 18, 243, 85, 25, 94, 102, 63, 56,
    63, 99, 219, 109, 115, 234, 63, 104, 86, 7, 246, 161, 50, 121, 215, 103, 132, 2, 197, 194, 7,
    99, 237, 177, 249, 53, 74, 11, 65, 133, 25, 157, 145, 21, 210, 116, 189, 50, 53, 210, 167, 40,
    206, 89, 149, 157, 111, 214, 130, 173, 160, 76, 80, 169, 249, 24, 232, 51, 65, 10, 59, 55, 223,
    55, 237, 62, 156, 252, 159, 178, 126, 86, 73, 59, 132, 81, 111, 163, 236, 166, 63, 194, 200, 35,
    184, 202, 167, 59, 185, 32, 224, 65, 186, 118, 174, 230, 79, 66, 97, 244, 46, 138, 84, 14, 122,
    36, 104, 232, 25, 88, 134, 145, 128, 216, 38, 113, 121, 172, 91, 127, 32, 195, 69, 42, 102, 16,
    78, 229, 188, 49, 252, 210, 90, 198, 118, 39, 209, 215, 186, 188, 194, 95, 17, 83, 114, 139,
    206, 123, 171, 132, 136, 85, 95, 99, 22, 12, 249, 249, 95, 218, 140, 45, 83, 141, 63, 207, 70,
    93, 151, 59, 75, 107, 55, 151, 40, 2, 3, 233, 190, 226, 80, 251, 176, 5, 22, 186, 45, 88, 115,
    244, 131, 43, 233, 241, 180, 47, 83, 125, 192, 4, 3, 119, 82, 152, 97, 73, 86, 47, 124, 186, 18,
    255, 220, 202, 62, 26, 36, 108, 62, 179, 32, 187, 237, 178, 233, 115, 128, 102, 160, 29, 94, 20,
    132, 1, 115, 28, 8, 216, 143, 184, 6,
]).buffer;

describe('ETH token definition', () => {
    test('Parse definition for USDC', () => {
        const dataView = new DataView(UsdcEthTokenDefinition);
        const magicString = new TextDecoder().decode(
            new Uint8Array(UsdcEthTokenDefinition.slice(0, 5)),
        );
        const definitionType = dataView.getUint8(5);
        const dataVersion = dataView.getUint32(6, true);
        const protobufLength = dataView.getUint16(10, true);
        const protobufPayload = new Uint8Array(
            UsdcEthTokenDefinition.slice(12, 12 + protobufLength),
        );

        expect(magicString).toBe('trzd1');
        expect(definitionType).toBe(1); // EthereumDefinitionType TOKEN
        expect(dataVersion).toBe(1680529464);
        expect(protobufLength).toBe(42);

        const proto = parseConfigure(messages);

        const Message = proto.lookupType('EthereumTokenInfo');

        const decoded = Message.decode(protobufPayload);

        const json = messageToJSON(decoded, decoded.$type.fields);

        const result = { ...json, address: `0x${json.address}` };

        expect(result).toMatchObject({
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            chain_id: 1,
            symbol: 'USDC',
            decimals: 6,
            name: 'USD Coin',
        });
    });
});
